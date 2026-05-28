import { SaltboxLocaleProvider } from "@saltbox/saltbox-frontend-common";
import { observer } from "mobx-react";
import { BrowserRouter, Route, Routes } from "react-router";

import { GeneralComponent } from "saltbox-gateway/general-сomponent";
import { gatewayResources } from "saltbox-gateway/store/i18n-resources";
import { i18nStore } from "saltbox-gateway/store/i18n-store";
import "@saltbox/saltbox-frontend-common/dist/saltbox-frontend-common.css";

export default observer(function Root() {
  return (
    <SaltboxLocaleProvider locale={i18nStore.currentLanguage} resources={gatewayResources}>
      <BrowserRouter>
        <Routes>
          <Route path="/gateway" element={<GeneralComponent />} />
        </Routes>
      </BrowserRouter>
    </SaltboxLocaleProvider>
  );
});
