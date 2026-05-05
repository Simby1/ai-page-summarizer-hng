document.addEventListener('DOMContentLoaded', async () => {
    const summarizeBtn = document.getElementById('summarize-btn');
    const resetBtn = document.getElementById('reset-btn');
    const outputArea = document.getElementById('summary-output');
    const loadingState = document.getElementById('loading-state');
    const pageTitleElement = document.getElementById('page-title');
  
    // Gets the current active tab and display its title
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      pageTitleElement.textContent = tab.title;
    }
  
    // Click to summarize
    summarizeBtn.addEventListener('click', async () => {
      loadingState.classList.remove('hidden');
      outputArea.innerHTML = '';
      summarizeBtn.disabled = true;
  
      try {
        // Request content from the Content Script-TODO
        const response = await chrome.tabs.sendMessage(tab.id, { action: "GET_CONTENT" });
        
        if (!response || !response.content) {
          throw new Error("Could not extract content from this page.");
        }
  
        // Send content to Background Script for AI processing-TODO
        chrome.runtime.sendMessage(
          { action: "SUMMARIZE", text: response.content },
          (apiResult) => {
            loadingState.classList.add('hidden');
            summarizeBtn.disabled = false;
  
            if (apiResult.error) {
              outputArea.innerHTML = `<p style="color: #ef4444;">Error: ${apiResult.error}</p>`;
            } else {
              outputArea.innerText = apiResult.summary;
            }
          }
        );
      } catch (error) {
        loadingState.classList.add('hidden');
        summarizeBtn.disabled = false;
        outputArea.innerHTML = `<p style="color: #ef4444;">${error.message}</p>`;
      }
    });
  
    // Reset
    resetBtn.addEventListener('click', () => {
      outputArea.innerHTML = '<p class="placeholder-text">Click the button to generate a summary.</p>';
    });
  });