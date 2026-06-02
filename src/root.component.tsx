import { SaltboxLocaleProvider } from "@saltbox/saltbox-frontend-common";
import { observer } from "mobx-react";
import { BrowserRouter, Route, Routes } from "react-router";

import { ServiceListPage } from "@features/service-list";
import { gatewayResources, i18nStore } from "@shared/i18n";
import "@saltbox/saltbox-frontend-common/dist/saltbox-frontend-common.css";

export default observer(function Root() {
  return (
    <SaltboxLocaleProvider locale={i18nStore.currentLanguage} resources={gatewayResources}>
      <BrowserRouter>
        <Routes>
          <Route path="/gateway" element={<ServiceListPage />} />
        </Routes>
      </BrowserRouter>
    </SaltboxLocaleProvider>
  );
});
