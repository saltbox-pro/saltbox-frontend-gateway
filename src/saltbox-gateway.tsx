import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";
import { appStore, envStore } from "saltbox-gateway/store";
import { autorun, runInAction } from "mobx";
import { i18nStore } from "saltbox-gateway/store/i18n-store";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  domElementGetter: () => document.getElementById("app-container"),
});

export const saltboxModule = {
  singleSpaLifecycle: lifecycles,
  name: "saltbox-frontend-gate",
  path: "/gateway",
  settingsConfig: {
    priority: 10,
    key: "gateway",
    label: "Gateway",
    children: [
      {
        key: "general",
        label: { en: "General", ru: "Основное" },
        path: "/gateway",
      },
    ],
  },
  init: (authStore, env, localeStore) => {
    appStore.init(authStore);
    runInAction(() => {
      envStore.env = env;
    });
    autorun(() => {
      i18nStore.currentLanguage = localeStore.currentLocale;
    });
  },
};
