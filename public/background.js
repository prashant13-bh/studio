// Listens for the extension icon click and opens the side panel.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for messages from the content script or side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendToSidePanel') {
    // Forward the message to the side panel
    chrome.runtime.sendMessage({
      action: 'displayData',
      data: request.data
    });
  } else if (request.action === 'readFromStorage') {
    chrome.storage.local.get(request.key, (result) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ data: result[request.key] });
      }
    });
    return true; // Indicates that the response is sent asynchronously
  } else if (request.action === 'writeToStorage') {
    chrome.storage.local.set({ [request.key]: request.value }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true });
      }
    });
    return true; // Indicates that the response is sent asynchronously
  }
});
