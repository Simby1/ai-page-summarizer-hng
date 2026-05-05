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
    // handling restricted URLs
    const isRestrictedPage = tab.url.startsWith('chrome://') || 
                            tab.url.startsWith('https://chromewebstore.google.com/') ||
                            !tab.url.startsWith('http');

    if (isRestrictedPage) {
        pageTitleElement.textContent = "Extension cannot run on this page";
        summarizeBtn.disabled = true;
        summarizeBtn.style.opacity = "0.5";
        summarizeBtn.innerText = "Summarizer Disabled";
        return; // Exit early
    }

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
        
        if (error.message.includes("Could not establish connection")) {
            outputArea.innerHTML = `
                <p style="color: #ef4444; font-weight: 600;">Connection Lost</p>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Please refresh the website you are trying to summarize and try again.</p>
            `;
        } else {
            outputArea.innerHTML = `<p style="color: #ef4444;">${error.message}</p>`;
        }
    }
    });
  
    // Reset
    resetBtn.addEventListener('click', () => {
      outputArea.innerHTML = '<p class="placeholder-text">Click the button to generate a summary.</p>';
    });
  });