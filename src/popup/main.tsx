// src/popup/main.tsx
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from "../popup/App.tsx";
import KeepBackgroundAliveProvider from "../providers/KeeBackgroundAlive.tsx";
import {Store} from "webext-redux";
import {Provider} from "react-redux";

const root = document.getElementById('root')!;
const store = new Store();

store.ready().then(() => {
    createRoot(root).render(
      <StrictMode>
        <Provider store={store}>
          <KeepBackgroundAliveProvider/>
          <App/>
        </Provider>
      </StrictMode>,
    )
  }
)
