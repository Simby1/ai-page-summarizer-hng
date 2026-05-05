document.addEventListener('DOMContentLoaded', async () => {
  // 1. CONSTANTS & UI ELEMENTS
  const summarizeBtn = document.getElementById('summarize-btn');
  const resetBtn = document.getElementById('reset-btn');
  const outputArea = document.getElementById('summary-output');
  const loadingState = document.getElementById('loading-state');
  const pageTitleElement = document.getElementById('page-title');
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsView = document.getElementById('settings-view');
  const apiKeyInput = document.getElementById('api-key-input');
  const saveKeyBtn = document.getElementById('save-key-btn');

  // 2. INITIALIZE TAB DATA 
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) return;
  pageTitleElement.textContent = tab.title;

  // 3. SECURITY & SETTINGS LOGIC
  settingsToggle.addEventListener('click', () => {
      settingsView.classList.toggle('hidden');
  });

  saveKeyBtn.addEventListener('click', async () => {
      const key = apiKeyInput.value.trim();
      if (key) {
          await chrome.storage.local.set({ apiKey: key });
          alert("API Key saved locally! 🚀");
          settingsView.classList.add('hidden');
          apiKeyInput.value = '';
          window.location.reload(); // Reload to refresh state
      }
  });

  // 4. CACHE CHECK: Load previous summary if it exists
  const cacheKey = `cache_${tab.url}`;
  const cachedData = await chrome.storage.local.get(cacheKey);

  if (cachedData[cacheKey]) {
      renderSummary(cachedData[cacheKey]);
  }

  // 5. RESTRICTED PAGE CHECK
  const isRestrictedPage = tab.url.startsWith('chrome://') || 
                           tab.url.startsWith('https://chromewebstore.google.com/') ||
                           !tab.url.startsWith('http');

  if (isRestrictedPage) {
      pageTitleElement.textContent = "Summarizer Disabled";
      summarizeBtn.disabled = true;
      summarizeBtn.style.opacity = "0.5";
      summarizeBtn.innerText = "Restricted Page";
      return; 
  }

  // 6. SUMMARIZE CLICK HANDLER
  summarizeBtn.addEventListener('click', async () => {
      loadingState.classList.remove('hidden');
      outputArea.innerHTML = '';
      summarizeBtn.disabled = true;

      try {
          // Check for API Key first
          const { apiKey } = await chrome.storage.local.get('apiKey');
          if (!apiKey) {
              throw new Error("Missing API Key. Click the gear icon to set it up.");
          }

          // Extract Content
          const response = await chrome.tabs.sendMessage(tab.id, { action: "GET_CONTENT" });
          if (!response || !response.content) {
              throw new Error("Could not extract content from this page.");
          }

          // Calculate Reading Time
          const wordCount = response.content.split(/\s+/).length;
          const readingTime = Math.ceil(wordCount / 200);
          pageTitleElement.textContent = `${tab.title} • ${readingTime} min read`;

          // Request AI Summary
          chrome.runtime.sendMessage(
              { action: "SUMMARIZE", text: response.content },
              (apiResult) => {
                  loadingState.classList.add('hidden');
                  summarizeBtn.disabled = false;

                  if (apiResult.error) {
                      outputArea.innerHTML = `<p style="color: #ef4444;">Error: ${apiResult.error}</p>`;
                  } else {
                      const cleanSummary = formatAIResponse(apiResult.summary);
                      renderSummary(cleanSummary);
                      // Save to Cache
                      chrome.storage.local.set({ [cacheKey]: cleanSummary });
                  }
              }
          );
      } catch (error) {
          loadingState.classList.add('hidden');
          summarizeBtn.disabled = false;
          outputArea.innerHTML = `<p style="color: #ef4444;">${error.message}</p>`;
      }
  });

  // 7. HELPER FUNCTIONS
  function formatAIResponse(text) {
      return text
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
          .replace(/^\* /gm, '• ')                        
          .replace(/\n/g, '<br>');                        
  }

  function renderSummary(htmlContent) {
      outputArea.innerHTML = `
          <div class="summary-text">${htmlContent}</div>
          <button id="copy-btn" class="secondary-btn" style="margin-top: 15px; width: 100%;">
              Copy Summary
          </button>
      `;

      document.getElementById('copy-btn').addEventListener('click', (e) => {
          const plainText = document.querySelector('.summary-text').innerText;
          navigator.clipboard.writeText(plainText);
          e.target.innerText = "✅ Copied!";
          setTimeout(() => { e.target.innerText = "Copy Summary"; }, 2000);
      });
  }

  // Reset Logic
  resetBtn.addEventListener('click', () => {
      outputArea.innerHTML = '<p class="placeholder-text">Click the button to generate a summary.</p>';
      chrome.storage.local.remove(cacheKey);
  });

  // Github Link
  document.getElementById('github-link').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://github.com/Simby1' });
  });
});