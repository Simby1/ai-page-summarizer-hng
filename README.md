# AI Page Summarizer (HNG Stage 4A)

A lightweight, secure Chrome Extension (Manifest V3) that extracts article content and generates AI-powered summaries.

## 🚀 Features
- **Smart Extraction:** Isolates main article text, ignoring sidebars and ads.
- **AI-Powered:** Integrates with Gemini/OpenAI for bulleted insights.
- **Secure Architecture:** API calls are handled in the background to protect secrets.
- **Cache Support:** Saves summaries locally to prevent redundant API usage.

## 🛠️ Tech Stack
- **Manifest V3**
- **Vanilla JavaScript** (ES6 Modules)
- **Tailwind CSS** (Optional/Popup styling)
- **Chrome Storage API**

## 📂 Project Structure
```text
├── manifest.json         # Extension configuration
├── background.js        # Service worker for API calls
├── content.js           # Content extraction script
├── popup/               # Extension UI
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── images/              # Icons
└── README.md
```

## ⚙️ Installation

1 **Clone this repository:**
 git clone [https://github.com/Simby1/ai-page-summarizer-hng.git](https://github.com/Simby1/ai-page-summarizer-hng.git)

2. **Load into Chrome:**
   - Navigate to `chrome://extensions`.
   - Enable **Developer Mode**.
   - Click **Load unpacked** and select the project folder.
3. **Configure API Key:**
   - Open the extension and click the ⚙️ icon.
   - Paste your **Gemini API Key** and click **Save**.
   - Refresh any webpage to begin summarizing.

## 🔒 Security & Architecture
- **Service Worker Communication:** All API calls are routed through the background script to keep logic centralized.
- **Local Persistence:** Sensitive data (API Keys) is stored using `chrome.storage.local`, ensuring it is never hardcoded or exposed in the content scripts.
- **Markdown Sanitization:** Custom regex implementation to render AI responses into clean, accessible HTML.