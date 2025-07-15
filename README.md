# 🤖 Palestinian and Non-Palestinian Fundraiser Automation — Chrome Extension

This extension was built out of necessity and compassion. While supporting Palestinian fundraisers and awareness posts on Twitter/X, I (Mearaj Bhagad) found myself repeatedly liking, retweeting, quoting, and replying to many of my followings' pinned tweets. It became clear: my behavior followed a pattern, and automating it could save hours.

Out of that realization, this extension was born — not only to help myself, but now, hopefully, others who engage in similar digital advocacy.

---

## ✨ Features

- ✅ **Automatically likes, retweets, replies**, and **quotes** pinned tweets from your followings  
- 🖼 Adds an **image** when quoting for better engagement  
- ⏱ Keeps track of **timestamps** to avoid duplicate or premature actions  
- 🧠 Uses keyword logic:
  - Posts with `"gaza"` or `"palestine"` → considered **Palestinian**
  - Otherwise, checks for `"donate"` / `"donation"` to determine relevance  
- 🔗 Manages **fundraiser URL lists** — includes & excludes domains as needed  
- 🧑‍🤝‍🧑 Supports both **manual** and **automated** following entry  
- 🪟 Uses a **Tab Controller** interface (the popup is just a launcher)  

---

## 💻 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-extension-repo.git
cd your-extension-repo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development mode

```bash
npm run dev
```

### 4. Load the extension in Chrome

- Go to `chrome://extensions`
- Enable **Developer Mode**
- Click **Load Unpacked**
- Select the `dist/` folder

---

## 🚀 Production Build

To generate the final build:

```bash
npm run build
```

Then zip the **contents** of the `dist/` folder for Chrome Web Store upload.

---

## 🧪 Why No Twitter API?

X (formerly Twitter) API access is costly and heavily restricted.

This extension avoids API limitations by automating browser tabs — simulating human behavior through Chrome’s extension APIs. It works reliably and privately, without server-side code or paid tiers.

---

## ⚙️ Tech Stack

- Vite + React + TypeScript  
- Redux Toolkit + Redux Saga  
- Chrome Extension Manifest V3 (MV3)  
- `chrome.storage.local` for per-user state persistence  

---

## 📦 Chrome Web Store

✅ **Available now:** [X-Routine-Automation on Chrome Web Store](https://chromewebstore.google.com/detail/x-routine-automation/laoofbnifdjaoijjjppdahengbmnaifm)

> Install directly from the official Chrome Web Store for easier access and automatic updates.

---

## 🙏 Acknowledgement

To everyone using their time and platform to support justice and relief efforts: this is for you.

If this extension saves you time, feel free to share it with others who might benefit.

---

## 🛡 License

[MIT](./LICENSE) © 2025 Mearaj Bhagad

---

> Below is the default Vite + React project info — kept for future reference.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh  
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh  

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
**Important Disclaimer:**  
This Chrome extension is intended for personal, non-commercial use only to automate routine tasks on X (formerly Twitter) in a user-controlled manner. Automating interactions like liking, reposting, replying, or quoting may violate X's [Automation Rules](https://help.twitter.com/en/rules-and-policies/twitter-automation) and [Platform Manipulation Policy](https://help.twitter.com/en/rules-and-policies/platform-manipulation). By using this tool, you acknowledge and accept full responsibility for any consequences, including potential account restrictions or suspension. Do not use it for spam, bulk engagement, or any activity that could be seen as inauthentic. Always respect X's rate limits, and we strongly recommend reviewing their policies before proceeding. The developer is not liable for misuse.
