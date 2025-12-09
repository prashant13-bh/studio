import { getEncoding, Tiktoken } from 'js-tiktoken';

let encoding: Tiktoken;

try {
  encoding = getEncoding('cl100k_base');
} catch (error) {
  console.error("Failed to load tokenizer, token counting will not be accurate.", error);
}

export function countTokens(text: string): number {
  if (!encoding) {
    // Fallback: 1 token ~= 4 chars in English
    return Math.ceil(text.length / 4);
  }
  return encoding.encode(text).length;
}

export function freeTokenizer() {
  if (encoding) {
    encoding.free();
  }
}
