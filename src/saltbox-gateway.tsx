import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";
import { appStore } from "saltbox-gateway/store";
import { runInAction } from "mobx";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  domElementGetter: () => document.getElementById("app-container"),
});

export const { bootstrap, mount, unmount } = lifecycles;

export const meta = {
  name: "saltbox-frontend-gate",
  path: "/gateway",
  settingsConfig: {
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
    // autorun(() => {
    //   let i18nStore;
    //   i18nStore.currentLanguage = localeStore.currentLocale;
    // });
  },
};
