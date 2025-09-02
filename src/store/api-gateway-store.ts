import { makeAutoObservable } from "mobx";
import {
  DiscoveryApi,
  Configuration,
} from "@saltbox/saltbox-gateway-api-client";
import { appStore } from "saltbox-gateway/store";

class ApiGatewayStore {
  private get apiConfig() {
    if (!appStore.authStore?.user?.access_token) return undefined;
    return new Configuration({
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
