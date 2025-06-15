chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'extractText') {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ content: selectedText || null });
  }
});
