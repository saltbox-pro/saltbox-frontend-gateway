import { computed, makeObservable, observable } from "mobx";
import {
  DiscoveryApi,
  Configuration,
} from "@saltbox/saltbox-gateway-api-client";
import { appStore, envStore } from "saltbox-gateway/store";

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
