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

- Clone this repository: git clone [https://github.com/Simby1/ai-page-summarizer-hng.git](https://github.com/Simby1/ai-page-summarizer-hng.git)

- Open Chrome and navigate to chrome://extensions.

- Enable Developer Mode (top right).

- Click Load unpacked and select the project folder.

## 🔒 Security Decisions
- Background Fetching: All API communication happens in the service worker.

- No Hardcoding: API keys are never stored in the content script or frontend.