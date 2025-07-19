# 📘 How to Use X-Routine Automation

> ⚠️ **Requirements:**  
> - A **desktop or laptop** (mobile devices are not supported)  
> - The **Google Chrome** browser installed

---

## 🚀 Getting Started

### ✅ 1. Install the Extension

- Visit the [Chrome Web Store page](https://chromewebstore.google.com/detail/x-routine-automation/laoofbnifdjaoijjjppdahengbmnaifm)
- Click the **"Add to Chrome"** button  
- Confirm the installation by selecting **"Add Extension"** in the popup

Once added, the extension icon will appear in the top-right corner of your browser (next to the address bar).  
If it doesn’t show up:

- Click the **puzzle piece (🔧 Extensions)** icon
- Click the **pin 📌 icon** next to **X-Routine Automation** to pin it for quick access

---

### 🖥 2. Open the Controller Interface

- Click the **X-Routine Automation** icon (now pinned)
- Select **"Open Controller"**

This opens a full-page controller UI in a new browser tab — the central dashboard where you'll manage all features.

---

## 👤 Manage Users

- Inside the Controller, click on **"Manage Users"** in the sidebar
- In the input field, enter your **X (Twitter) username**, without the **@** symbol
  - For example: `elonmusk` (not `@elonmusk`)
- Click the **"Set Active"** button to save this user as your active account

---

## 🔄 Manage Follows

- From the sidebar, go to **"Manage Follows"**
- Click **"Collect Followings"**
  - The extension will open a new tab and scroll through your entire following list on Twitter to gather accounts
  - This might take some time depending on how many people you follow
- **Optional for later use:**  
  Enable the checkbox **"Skip on First Visible"** to only sync new followings added since last time (faster re-sync)

---

## 🔗 Manage Fundraiser URLs

- Navigate to **"Manage URLs"**
- In the **Include URLs** section, paste any number of fundraiser or tweet URLs
  - You can separate them by new lines or spaces
- In the **Exclude URLs** section, add any domains or links that should be ignored (e.g., spam or irrelevant sites)

---

## 🧠 How It Works

The extension detects and prioritizes posts with:
- Keywords like `"gaza"` or `"palestine"` → considered **Palestinian**
- Keywords like `"donate"` or `"donation"` → considered **Non-Palestinian Fundraisers**

It also intelligently avoids duplicate actions and respects time gaps between activity to mimic natural behavior.

---

## 💬 Manage Tweets and Start Automation

- Go to **"Manage Tweets"**
- Click **"Start Like and Repost"**
  - This will begin the automatic routine: liking, reposting, quoting, and replying to fundraiser tweets
- You will see:
  - A status indicator: **Running / Stopped**
  - Additional settings to fine-tune how and when actions are performed
- You can paste specific **tweet URLs** in the **Source URLs** section
  - These will be prioritized first in the automation queue

---

## ⚙️ Custom Settings (Optional)

On the **Manage Tweets** page, you can:

- Set text templates for:
  - **Quote tweets**, **Reposts**, and **Gaza-specific messages**
- Specify **image search terms** to attach contextually relevant images
- Control wait durations, delays between actions, and thresholds

There’s also a **Reset to Default** button if you want to revert all inputs to their original state.

---

## 📤 Exporting Verified Users

If enabled, you'll see an **"Export Verified Users"** button next to the automation controls.  
Clicking this will download a `verifiedUsers.txt` file — a sorted list of all users verified by the system.

---

## 🧪 Important Notes

- This tool mimics real user interactions by using Chrome tabs — it does **not** use the Twitter/X API
- It’s safe and private: all data is stored locally, nothing is sent to external servers
- Make sure not to overuse or misuse — follow Twitter's [Automation Rules](https://help.twitter.com/en/rules-and-policies/twitter-automation)

---

## 🙌 You're All Set!

Once you’ve explored the tabs and configured your inputs, the extension will do the work for you.

If you’re ever unsure — just click around. The UI is made to be intuitive and forgiving.

Happy automating ✊
