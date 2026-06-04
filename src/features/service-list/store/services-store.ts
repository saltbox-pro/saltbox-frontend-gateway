import { ProxyBalancingStrategy, ServiceSchemaOutput } from "@saltbox/saltbox-gateway-api-client";
import { action, makeObservable, observable, runInAction } from "mobx";

import { apiGatewayStore } from "@shared/api";

export class ServicesStore {
  @observable isLoading: boolean;
  @observable isToggleLoading: boolean;
  @observable isDeleteServiceLoading: boolean;
  @observable isDeleteInstanceLoading: boolean;
  @observable isChangeBalancingLoading: boolean;
  @observable services: ServiceSchemaOutput[];
  @observable selectedService: ServiceSchemaOutput | null;
  @observable error: string | null;

  constructor() {
    this.isLoading = false;
    this.isToggleLoading = false;
    this.isDeleteServiceLoading = false;
    this.isDeleteInstanceLoading = false;
    this.isChangeBalancingLoading = false;
    this.services = [];
    this.selectedService = null;
    this.error = null;
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
          this.error = "general.load-services-failed";
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
    } catch {
      runInAction(() => {
        this.error = "general.toggle-service-failed";
      });
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
    } catch {
      runInAction(() => {
        this.error = "general.delete-service-failed";
      });
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
    } catch {
      runInAction(() => {
        this.error = "general.delete-instance-failed";
      });
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
    } catch {
      runInAction(() => {
        this.error = "general.change-balancing-failed";
      });
    } finally {
      runInAction(() => {
        this.isChangeBalancingLoading = false;
      });
    }
  };

  @action setSelectedService = (service: ServiceSchemaOutput | null) => {
    this.selectedService = service;
  };

  @action resetError = () => {
    this.error = null;
  };
}
