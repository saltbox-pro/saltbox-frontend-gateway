import { createLoader } from "@saltbox/saltbox-frontend-common";
import { ProxyBalancingStrategy, ServiceSchemaOutput } from "@saltbox/saltbox-gateway-api-client";
import { action, computed, makeObservable, observable, ObservableSet, runInAction } from "mobx";

import { apiGatewayStore } from "@shared/api";

function instanceLoadingKey(serviceName: string, instanceId: string): string {
  return `${serviceName}:${instanceId}`;
}

export class ServicesStore {
  @observable isToggleLoading: boolean;
  @observable isDeleteServiceLoading: boolean;
  @observable balancingLoadingByService: ObservableSet<string>;
  @observable deletingInstanceKeys: ObservableSet<string>;
  @observable services: ServiceSchemaOutput[];
  @observable selectedService: ServiceSchemaOutput | null;

  readonly servicesLoad = createLoader({
    run: () => apiGatewayStore.discoveryApi?.getServicesApiDiscoveryServicesGet(),
    onSuccess: (serv) => {
      this.services = serv;
      this.selectedService = this.selectedService
        ? (serv.find((s) => s.name === this.selectedService!.name) ?? null)
        : null;
    },
  });

  constructor() {
    this.isToggleLoading = false;
    this.isDeleteServiceLoading = false;
    this.balancingLoadingByService = observable.set();
    this.deletingInstanceKeys = observable.set();
    this.services = [];
    this.selectedService = null;
    makeObservable(this);
  }

  @computed get isLoading(): boolean {
    return this.servicesLoad.isLoading;
  }

  isBalancingLoading = (serviceName: string): boolean => {
    return this.balancingLoadingByService.has(serviceName);
  };

  isInstanceDeleting = (serviceName: string, instanceId: string): boolean => {
    return this.deletingInstanceKeys.has(instanceLoadingKey(serviceName, instanceId));
  };

  loadServices = () => {
    this.servicesLoad.run().catch(() => undefined);
  };

  @action toggleService = async (service: ServiceSchemaOutput): Promise<void> => {
    this.isToggleLoading = true;

    const request =
      apiGatewayStore.discoveryApi?.enableDisableServiceApiDiscoveryServicesServiceNameTogglePost({
        service_name: service.name,
        BodyEnableDisableServiceApiDiscoveryServicesServiceNameTogglePost: {
          enabled: !service.enabled,
        },
      });

    if (!request) {
      runInAction(() => {
        this.isToggleLoading = false;
      });
      return Promise.reject(new Error("Failed to toggle service"));
    }

    try {
      await request;
      this.loadServices();
    } finally {
      runInAction(() => {
        this.isToggleLoading = false;
      });
    }
  };

  @action deleteService = async (service: ServiceSchemaOutput): Promise<void> => {
    this.isDeleteServiceLoading = true;

    const request =
      apiGatewayStore.discoveryApi?.removeServiceApiDiscoveryUnregisterServiceNameDelete({
        service_name: service.name,
      });

    if (!request) {
      runInAction(() => {
        this.isDeleteServiceLoading = false;
      });
      return Promise.reject(new Error("Failed to delete service"));
    }

    try {
      await request;
      runInAction(() => {
        this.selectedService = null;
      });
      this.loadServices();
    } finally {
      runInAction(() => {
        this.isDeleteServiceLoading = false;
      });
    }
  };

  @action deleteInstance = async (
    service: ServiceSchemaOutput,
    instanceId: string
  ): Promise<void> => {
    const key = instanceLoadingKey(service.name, instanceId);
    this.deletingInstanceKeys.add(key);

    const request =
      apiGatewayStore.discoveryApi?.removeInstanceApiDiscoveryUnregisterServiceNameInstanceIdDelete(
        {
          service_name: service.name,
          instance_id: instanceId,
        }
      );

    if (!request) {
      runInAction(() => {
        this.deletingInstanceKeys.delete(key);
      });
      return Promise.reject(new Error("Failed to delete instance"));
    }

    try {
      await request;
      this.loadServices();
    } finally {
      runInAction(() => {
        this.deletingInstanceKeys.delete(key);
      });
    }
  };

  @action changeBalancing = async (
    service: ServiceSchemaOutput,
    strategy: ProxyBalancingStrategy
  ): Promise<void> => {
    this.balancingLoadingByService.add(service.name);

    const request =
      apiGatewayStore.discoveryApi?.changeBalancingStrategyApiDiscoveryServicesServiceNameChangeStrategyPatch(
        {
          service_name: service.name,
          BodyChangeBalancingStrategyApiDiscoveryServicesServiceNameChangeStrategyPatch: {
            strategy,
          },
        }
      );

    if (!request) {
      runInAction(() => {
        this.balancingLoadingByService.delete(service.name);
      });
      return Promise.reject(new Error("Failed to change balancing strategy"));
    }

    try {
      await request;
      this.loadServices();
    } finally {
      runInAction(() => {
        this.balancingLoadingByService.delete(service.name);
      });
    }
  };

  @action setSelectedService = (service: ServiceSchemaOutput | null) => {
    this.selectedService = service;
  };
}
