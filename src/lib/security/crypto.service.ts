const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function stringToArrayBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function arrayBufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const masterKey = await window.crypto.subtle.importKey(
    'raw',
    stringToArrayBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    masterKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: string, password: string): Promise<string> {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const key = await deriveKey(password, salt);
  
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    stringToArrayBuffer(data)
  );

  const encryptedBytes = new Uint8Array(encryptedContent);
  const finalBuffer = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
  finalBuffer.set(salt, 0);
  finalBuffer.set(iv, salt.length);
  finalBuffer.set(encryptedBytes, salt.length + iv.length);

  return btoa(String.fromCharCode(...finalBuffer));
}

export async function decryptData(encryptedString: string, password: string): Promise<string> {
  try {
    const encryptedData = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));

    const salt = encryptedData.slice(0, SALT_LENGTH);
    const iv = encryptedData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const data = encryptedData.slice(SALT_LENGTH + IV_LENGTH);

    const key = await deriveKey(password, salt);
    
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    return arrayBufferToString(decryptedContent);
  } catch (e) {
    console.error("Decryption failed:", e);
    throw new Error("Invalid password or corrupted data.");
  }
}
