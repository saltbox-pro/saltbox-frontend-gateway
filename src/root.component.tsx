import { BrowserRouter, Route, Routes } from "react-router";
import { GeneralComponent } from "saltbox-gateway/general-сomponent";
import "@saltbox/saltbox-frontend-common/dist/saltbox-frontend-common.css";

export default function Root(props) {
  return (
    <BrowserRouter basename="/gateway">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <GeneralComponent />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
