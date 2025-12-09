// Listen for messages from the content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Use a switch statement to handle different actions
  switch (request.action) {
    // Action to open the side panel
    case 'openSidePanel':
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
      sendResponse({ status: 'Side panel opened' });
      break;

    // Action to read data from chrome.storage.local
    case 'readFromStorage':
      chrome.storage.local.get(request.key, (result) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ data: result[request.key] });
        }
      });
      // Return true to indicate you wish to send a response asynchronously
      return true;

    // Action to write data to chrome.storage.local
    case 'writeToStorage':
      chrome.storage.local.set({ [request.key]: request.value }, () => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ status: 'success' });
        }
      });
      // Return true for async response
      return true;
    
    // Default case for unhandled actions
    default:
      sendResponse({ error: 'Unknown action' });
      break;
  }
  // Return true for any async action to keep the message channel open
  return true;
});

// Open the side panel when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
});
