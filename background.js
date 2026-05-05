// Listens for the "SUMMARIZE" message from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SUMMARIZE") {
      handleSummarization(request.text, sendResponse);
      return true; 
    }
  });
  
  async function handleSummarization(text, sendResponse) {
    try {
      const { apiKey } = await chrome.storage.local.get('apiKey');
  
      // use gemini-3-flash-preview for v1beta
     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
     method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Provide 3-5 concise bullet points summarizing this article: ${text}` }]
          }]
        })
      });
  
      const data = await response.json();
  
      if (data.candidates && data.candidates.length > 0) {
        const summary = data.candidates[0].content.parts[0].text;
        sendResponse({ summary: summary });
      } else if (data.error) {
        sendResponse({ error: data.error.message });
      } else {
        sendResponse({ error: "The AI refused this content. Try a different website." });
      }
  
    } catch (error) {
      sendResponse({ error: "Connection error. Please check your internet." });
    }
  }