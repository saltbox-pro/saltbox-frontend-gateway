import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  domElementGetter: () => document.getElementById("app-container"),
});

export const { bootstrap, mount, unmount } = lifecycles;

export const meta = {
  name: "saltbox-frontend-gate",
  path: "/gate",
  settingsConfig: {
    key: "gate",
    label: "Gate",
    children: [
      {
        key: "general",
        label: { en: "General", ru: "Основное" },
        path: "/gate",
      },
    ],
  },
  // init: (authStore, env, localeStore) => {
  //   appStore.init(authStore);
  //   runInAction(() => {
  //     envStore.env = env;
  //   });
  //   autorun(() => {
  //     i18nStore.currentLanguage = localeStore.currentLocale;
  //   });
  // },
};
