chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Content script received message:", request); // debug
    if (request.action === "GET_CONTENT") {
      const pageContent = extractMainContent();
      sendResponse({ content: pageContent });
    }
    return true; 
  });
  
  function extractMainContent() {
    // get standard article tags first
    const article = document.querySelector('article');
    if (article) return article.innerText;
  
    // get common main container IDs/Classes
    const main = document.querySelector('main') || 
                 document.querySelector('#content') || 
                 document.querySelector('.post-content');
    if (main) return main.innerText;
  
    // grab all paragraph text if no article/main tags exist
    const paragraphs = Array.from(document.querySelectorAll('p'));
    const text = paragraphs
      .map(p => p.innerText)
      .filter(t => t.length > 50) // ignore tiny snippets like "Click here"
      .join('\n\n');
  
    return text || "No readable content found on this page.";
  }