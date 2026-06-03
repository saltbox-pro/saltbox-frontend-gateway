import { createServerErrorMiddleware } from "@saltbox/saltbox-frontend-common";
import { DiscoveryApi, Configuration } from "@saltbox/saltbox-gateway-api-client";
import { computed, makeObservable, observable } from "mobx";

import { envStore } from "@shared/config";
import { appStore } from "@shared/stores";

class ApiGatewayStore {
  @observable serviceName: string;

  private get apiConfig() {
    if (!this.env || !appStore.authStore?.user?.access_token) {
      return undefined;
    }
    return new Configuration({
      basePath: this.env?.api_base_path,
      headers: {
        Authorization: `Bearer ${appStore.authStore.user.access_token}`,
      },
      middleware: [createServerErrorMiddleware()],
    });
  }

  constructor(serviceName: string) {
    makeObservable(this);

    this.serviceName = serviceName;
  }

  @computed get env() {
    return envStore?.services?.get(this.serviceName);
  }

  @computed get discoveryApi() {
    return this.apiConfig && new DiscoveryApi(this.apiConfig);
  }
}

export const apiGatewayStore = new ApiGatewayStore("gateway");
