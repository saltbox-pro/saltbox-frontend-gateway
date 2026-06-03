import { ProxyBalancingStrategy, ServiceSchemaOutput } from "@saltbox/saltbox-gateway-api-client";
import { action, makeObservable, observable, runInAction } from "mobx";

import { apiGatewayStore } from "@shared/api";

export class ServicesStore {
  @observable isLoading = false;
  @observable isToggleLoading = false;
  @observable isDeleteServiceLoading = false;
  @observable isDeleteInstanceLoading = false;
  @observable isChangeBalancingLoading = false;
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

  @action toggleService = async (service: ServiceSchemaOutput): Promise<void> => {
    this.isToggleLoading = true;
    try {
      await apiGatewayStore.discoveryApi?.enableDisableServiceApiDiscoveryServicesServiceNameTogglePost(
        {
          service_name: service.name,
          BodyEnableDisableServiceApiDiscoveryServicesServiceNameTogglePost: {
            enabled: !service.enabled,
          },
        }
      );
      this.loadServices();
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => {
        this.isToggleLoading = false;
      });
    }
  };

  @action deleteService = async (service: ServiceSchemaOutput): Promise<void> => {
    this.isDeleteServiceLoading = true;
    try {
      await apiGatewayStore.discoveryApi?.removeServiceApiDiscoveryUnregisterServiceNameDelete({
        service_name: service.name,
      });
      runInAction(() => {
        this.selectedService = null;
      });
      this.loadServices();
    } catch (error) {
      console.error(error);
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
    this.isDeleteInstanceLoading = true;
    try {
      await apiGatewayStore.discoveryApi?.removeInstanceApiDiscoveryUnregisterServiceNameInstanceIdDelete(
        {
          service_name: service.name,
          instance_id: instanceId,
        }
      );
      this.loadServices();
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => {
        this.isDeleteInstanceLoading = false;
      });
    }
  };

  @action changeBalancing = async (
    service: ServiceSchemaOutput,
    strategy: ProxyBalancingStrategy
  ): Promise<void> => {
    this.isChangeBalancingLoading = true;
    try {
      await apiGatewayStore.discoveryApi?.changeBalancingStrategyApiDiscoveryServicesServiceNameChangeStrategyPatch(
        {
          service_name: service.name,
          BodyChangeBalancingStrategyApiDiscoveryServicesServiceNameChangeStrategyPatch: {
            strategy,
          },
        }
      );
      this.loadServices();
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => {
        this.isChangeBalancingLoading = false;
      });
    }
  };

  @action setSelectedService = (service: ServiceSchemaOutput | null) => {
    this.selectedService = service;
  };
}
