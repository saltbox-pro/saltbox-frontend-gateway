import { ProxyBalancingStrategy, ServiceSchemaOutput } from "@saltbox/saltbox-gateway-api-client";
import { action, makeObservable, observable, runInAction } from "mobx";

import { apiGatewayStore } from "@shared/api";

export class ServicesStore {
  @observable isLoading = false;
  @observable services: ServiceSchemaOutput[] = [];
  @observable selectedService: ServiceSchemaOutput | null = null;

  constructor() {
    makeObservable(this);
  }

  @action loadServices = () => {
    this.isLoading = true;
    apiGatewayStore.discoveryApi
      ?.getServicesApiDiscoveryServicesGet()
      .then((serv) => {
        runInAction(() => {
          this.services = serv;
          this.selectedService = this.selectedService
            ? (serv.find((s) => s.name === this.selectedService!.name) ?? null)
            : null;
          this.isLoading = false;
        });
      })
      .catch(() => {
        runInAction(() => {
          this.isLoading = false;
        });
      });
  };

  @action toggleService = (service: ServiceSchemaOutput) => {
    apiGatewayStore.discoveryApi
      ?.enableDisableServiceApiDiscoveryServicesServiceNameTogglePost({
        service_name: service.name,
        BodyEnableDisableServiceApiDiscoveryServicesServiceNameTogglePost: {
          enabled: !service.enabled,
        },
      })
      .then(() => this.loadServices())
      .catch(console.error);
  };

  @action deleteService = (service: ServiceSchemaOutput) => {
    apiGatewayStore.discoveryApi
      ?.removeServiceApiDiscoveryUnregisterServiceNameDelete({ service_name: service.name })
      .then(() => {
        runInAction(() => {
          this.selectedService = null;
        });
        this.loadServices();
      })
      .catch(console.error);
  };

  @action deleteInstance = (service: ServiceSchemaOutput, instanceId: string) => {
    apiGatewayStore.discoveryApi
      ?.removeInstanceApiDiscoveryUnregisterServiceNameInstanceIdDelete({
        service_name: service.name,
        instance_id: instanceId,
      })
      .then(() => this.loadServices())
      .catch(console.error);
  };

  @action changeBalancing = (service: ServiceSchemaOutput, strategy: ProxyBalancingStrategy) => {
    apiGatewayStore.discoveryApi
      ?.changeBalancingStrategyApiDiscoveryServicesServiceNameChangeStrategyPatch({
        service_name: service.name,
        BodyChangeBalancingStrategyApiDiscoveryServicesServiceNameChangeStrategyPatch: {
          strategy,
        },
      })
      .then(() => this.loadServices())
      .catch(console.error);
  };

  @action setSelectedService = (service: ServiceSchemaOutput | null) => {
    this.selectedService = service;
  };
}
