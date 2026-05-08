document.addEventListener('DOMContentLoaded', async () => {
    const summarizeBtn = document.getElementById('summarize-btn');
    const outputArea = document.getElementById('summary-output');
    const loadingState = document.getElementById('loading-state');
    const pageTitleElement = document.getElementById('page-title');

    // 1. Initialize Tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    pageTitleElement.textContent = tab.title;

    // 2. Check Cache (Immediate display if already summarized)
    const cacheKey = `cache_${tab.url}`;
    const cachedData = await chrome.storage.local.get(cacheKey);
    if (cachedData[cacheKey]) {
        renderSummary(cachedData[cacheKey]);
    }

    // 3. Summarize Click Handler
    summarizeBtn.addEventListener('click', async () => {
        loadingState.classList.remove('hidden');
        outputArea.innerHTML = '';
        summarizeBtn.disabled = true;

        try {
            // Retrieve pre-loaded key from storage
            const { apiKey } = await chrome.storage.local.get('apiKey');
            if (!apiKey) {
                throw new Error("API Key not found in local storage. Please configure your environment.");
            }

            // Extract content via Content Script
            const response = await chrome.tabs.sendMessage(tab.id, { action: "GET_CONTENT" });
            if (!response || !response.content) throw new Error("Could not extract page content.");

            // Process via Background Script
            chrome.runtime.sendMessage(
                { action: "SUMMARIZE", text: response.content },
                (apiResult) => {
                    loadingState.classList.add('hidden');
                    summarizeBtn.disabled = false;

                    if (apiResult.error) {
                        outputArea.innerHTML = `<p style="color: #ef4444;">${apiResult.error}</p>`;
                    } else {
                        const cleanSummary = formatAIResponse(apiResult.summary);
                        renderSummary(cleanSummary);
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

    // Formatting & Rendering Helpers
    function formatAIResponse(text) {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                   .replace(/^\* /gm, '• ')
                   .replace(/\n/g, '<br>');
    }

    function renderSummary(htmlContent) {
        outputArea.innerHTML = `<div class="summary-text">${htmlContent}</div>`;
    }
});