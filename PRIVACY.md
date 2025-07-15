# Privacy Policy  
**x-routine-automation**  
*Last updated: 15 July 2025*

**x-routine-automation** is a Chrome Extension that lets you **batch-perform actions on X (Twitter)**—such as liking, reposting (retweet), replying, or quoting—according to rules the **user explicitly defines**.  
The extension runs **entirely in your browser**; it never sends data to our servers (we don’t have any).

---

## 1. Data We Store & Why  

| Data item | Where it’s stored | Purpose | How to delete it |
|-----------|-------------------|---------|------------------|
| **Followings list** (usernames you follow) | `chrome.storage.local` | Used to filter actions only to followed users. | Open Options → “Clear Local Data” or remove the extension. |
| **Fundraiser URLs** | `chrome.storage.local` | Used to match tweets containing these links. | Same as above. |
| **Timestamps of automated actions** | `chrome.storage.local` | Used for local rate-limiting and logs. | Same as above. |

> We do **not** collect or transmit:
> - Your Twitter credentials, cookies, or tokens  
> - Personal identifiers (name, email, IP)  
> - Browsing history outside of `https://twitter.com/*`

---

## 2. Permissions Explained  

| Chrome permission | Why it’s needed |
|-------------------|-----------------|
| `tabs` | To detect if a Twitter tab is open. |
| `scripting` | To automate clicks inside Twitter only when triggered. |
| `storage` | To store your settings and logs locally. |

No host or optional permissions are used.

---

## 3. User Control  

- **Start/Stop:** Automation only runs when *you* click “Run Automation”.
- **Rate Limits:** Default delay is 45–90 seconds between actions.
- **Data Access:** View and clear data via Options → **Data** tab.
- **Uninstall:** Removes all local data automatically.

---

## 4. Platform-Policy Notice (X / Twitter)

Automating interactions on X may violate its [Automation Rules](https://help.twitter.com/en/rules-and-policies/twitter-automation).  
By using this extension, you agree to:

1. Use automation **only on your own account**.
2. Respect rate limits and avoid spam-like behavior.
3. Accept that misuse may lead to account enforcement by X, not the extension author.

We include built-in limits, but **you are responsible** for how you use the tool.

---

## 5. Changes to This Policy  

We’ll update this file and show a notice in the extension if major changes occur.

---

## 6. Contact  

Questions, issues, or contributions:  
→ [GitHub Repository](https://github.com/mearaj/x-routine-automation)

**Important Disclaimer:**  
This Chrome extension is intended for personal, non-commercial use only to automate routine tasks on X (formerly Twitter) in a user-controlled manner. Automating interactions like liking, reposting, replying, or quoting may violate X's [Automation Rules](https://help.twitter.com/en/rules-and-policies/twitter-automation) and [Platform Manipulation Policy](https://help.twitter.com/en/rules-and-policies/platform-manipulation). By using this tool, you acknowledge and accept full responsibility for any consequences, including potential account restrictions or suspension. Do not use it for spam, bulk engagement, or any activity that could be seen as inauthentic. Always respect X's rate limits, and we strongly recommend reviewing their policies before proceeding. The developer is not liable for misuse.
