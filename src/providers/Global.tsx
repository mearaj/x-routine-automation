import {type ReactNode, useEffect} from "react";


function GlobalProvider({children}: Readonly<{ children: ReactNode }>) {
  useEffect(() => {
    const controllerUrl = chrome.runtime.getURL("controller.html");

    chrome.tabs.query({}, (tabs) => {
      const controllerTab = tabs.find(tab => tab.url?.startsWith(controllerUrl));
      if (controllerTab?.id !== undefined) {
        console.log("Controller Tab ID:", controllerTab.id);
      }
    });
  }, []);

  return children;
}

export default GlobalProvider;
