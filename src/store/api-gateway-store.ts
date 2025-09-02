import { makeAutoObservable } from "mobx";
import {
  DiscoveryApi,
  Configuration,
} from "@saltbox/saltbox-gateway-api-client";
import { appStore, envStore } from "saltbox-gateway/store";

class ApiGatewayStore {
  private get apiConfig() {
    if (!envStore.env || !appStore.authStore?.user?.access_token)
      return undefined;
    return new Configuration({
      basePath: envStore.env.api_base_path,
      headers: {
        Authorization: `Bearer ${appStore.authStore.user.access_token}`,
      },
    });
  }

  get discoveryApi() {
    return this.apiConfig && new DiscoveryApi(this.apiConfig);
  }

  constructor() {
    makeAutoObservable(this);
  }
}

export const apiGatewayStore = new ApiGatewayStore();
