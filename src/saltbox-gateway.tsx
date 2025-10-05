import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";
import { appStore, envStore } from "saltbox-gateway/store";
import { runInAction } from "mobx";
import { i18nStore } from "saltbox-gateway/store/i18n-store";
import { SaltboxModule } from "@saltbox/saltbox-frontend-common";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  domElementGetter: () => document.getElementById("app-container"),
});

export const saltboxModule: SaltboxModule = {
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
  init: (authStore, services, localeStore, pluginsStore) => {
    appStore.init(authStore, pluginsStore);
    runInAction(() => {
      for (const service of services) {
        envStore.services.set(service.service_name, service.env);
      }
      if (!envStore.services.has("gateway")) {
        envStore.services.set("gateway", {
          api_base_path: "",
          ws_server_url: null,
        });
      }
    });
    localeStore.subscribe(() => {
      i18nStore.currentLanguage = localeStore.currentLocale;
    });
  },
};
