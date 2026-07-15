import {
  SaltboxLocaleProvider,
  createModuleErrorBoundaryKit,
} from "@saltbox/saltbox-frontend-common";
import { observer } from "mobx-react";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router";

import { ServiceListPage } from "@features/service-list";
import { gatewayResources, i18nStore } from "@shared/i18n";
import "@saltbox/saltbox-frontend-common/dist/saltbox-frontend-common.css";

const MODULE_NAME = "Gateway";
const MAIN_PATH = "/gateway";

const { createRoutes } = createModuleErrorBoundaryKit({
  ErrorBoundary,
  moduleName: MODULE_NAME,
  homePath: MAIN_PATH,
  routing: { useNavigate, useLocation },
});

const gatewayRoutes = createRoutes(Route, [{ path: MAIN_PATH, element: <ServiceListPage /> }]);

export default observer(function Root() {
  return (
    <SaltboxLocaleProvider locale={i18nStore.currentLanguage} resources={gatewayResources}>
      <BrowserRouter>
        <Routes>{gatewayRoutes}</Routes>
      </BrowserRouter>
    </SaltboxLocaleProvider>
  );
});
