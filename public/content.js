/**
 * This function extracts visible text from the main content area of the page.
 * It filters out common non-content elements like headers, footers, and navs.
 * @returns {string} The extracted text content.
 */
function extractPageContent() {
  const mainContent = document.body;
  if (!mainContent) return '';

  // Clone the body to avoid modifying the live DOM
  const clone = mainContent.cloneNode(true);

  // Remove script, style, and other non-visible elements
  clone.querySelectorAll('script, style, noscript, svg, header, footer, nav, aside').forEach(el => el.remove());

  // Get the text content, which is now cleaner
  let text = clone.innerText || '';

  // Basic cleanup
  text = text.replace(/\s\s+/g, ' ').trim();

  return text.substring(0, 4000); // Limit size
}


// Listen for messages from the background script or side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    const pageContent = extractPageContent();
    sendResponse({ data: pageContent });
  }
});
