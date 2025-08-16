import {type ReactNode, useEffect} from "react";
import {useAppDispatch} from "@/store";
import {globalAppStateActions} from "@/store/slices/globalAppState.ts";


function GlobalProvider({children}: Readonly<{ children: ReactNode }>) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(globalAppStateActions.setVerifiedByRadioWaterMelonState({data: new Set<string>(), state: "loading"}));
  }, [dispatch]);

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
