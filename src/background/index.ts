console.log("background extension installed and is compiled and empty");
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-controller",
    title: "Open Controller",
    contexts: ["action"] // shows when right-clicking the extension icon
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "open-controller") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("controller.html") // update if controller is at a different path
    });
  }
});
