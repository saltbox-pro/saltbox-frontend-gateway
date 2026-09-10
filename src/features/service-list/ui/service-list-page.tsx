import { SyncOutlined } from "@ant-design/icons";
import { ErrorZone, Modal, PageHeader, runMutation } from "@saltbox/saltbox-frontend-common";
import { ProxyBalancingStrategy, ServiceSchemaOutput } from "@saltbox/saltbox-gateway-api-client";
import { Button, List } from "antd";
import { observer } from "mobx-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ServiceDetailsModal } from "@features/service-details";

import { ServicesStore } from "../store/services-store";

import { ServiceCard } from "./service-card";
import styles from "./service-list-page.module.css";

export const ServiceListPage = observer(() => {
  const { t } = useTranslation();
  const [store] = useState(() => new ServicesStore());
  const [modal, contextHolder] = Modal.useModal();

  useEffect(() => {
    store.loadServices();
  }, [store]);

  const selectedService = store.selectedService;
  // Чтение set в рендере observer: иначе loading удаления инстанса не обновится
  // (ServiceDetailsModal не observer, а ленивый колбэк сам подписку не создаёт).
  const deletingInstanceIds =
    selectedService == null
      ? null
      : selectedService.instances
          .filter((instance) => store.isInstanceDeleting(selectedService.name, instance.id))
          .map((instance) => instance.id);

  const handleToggle = useCallback(
    (service: ServiceSchemaOutput) => {
      modal.confirm({
        title: service.enabled ? t("general.disable-service") : t("general.enable-service"),
        content: service.enabled
          ? t("general.are-you-sure-disable-service")
          : t("general.are-you-sure-enable-service"),
        okText: t("general.confirm"),
        cancelText: t("general.cancel"),
        onOk() {
          return runMutation({
            run: () => store.toggleService(service),
            errorMessage: t("general.toggle-service-failed"),
          });
        },
      });
    },
    [modal, t, store]
  );

  const handleDeleteService = useCallback(
    (service: ServiceSchemaOutput) => {
      return runMutation({
        run: () => store.deleteService(service),
        errorMessage: t("general.delete-service-failed"),
      });
    },
    [store, t]
  );

  const handleDeleteInstance = useCallback(
    (service: ServiceSchemaOutput, instanceId: string) => {
      return runMutation({
        run: () => store.deleteInstance(service, instanceId),
        errorMessage: t("general.delete-instance-failed"),
      });
    },
    [store, t]
  );

  const handleChangeBalancing = useCallback(
    (service: ServiceSchemaOutput, strategy: ProxyBalancingStrategy) => {
      return runMutation({
        run: () => store.changeBalancing(service, strategy),
        errorMessage: t("general.change-balancing-failed"),
      });
    },
    [store, t]
  );

  return (
    <>
      {contextHolder}

      <PageHeader title={t("general.title")} />

      <div className={styles.container}>
        <div className={styles.toolbar}>
          <Button
            type="primary"
            icon={<SyncOutlined />}
            loading={store.isLoading}
            onClick={() => store.loadServices()}
          >
            {t("general.refresh")}
          </Button>
        </div>

        <ErrorZone level="block" loaders={[store.servicesLoad]}>
          <List
            loading={store.isLoading}
            grid={{ gutter: 24, xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 3 }}
            dataSource={store.services}
            renderItem={(service) => (
              <ServiceCard
                service={service}
                onDetails={store.setSelectedService}
                onChangeBalancing={handleChangeBalancing}
                isChangeBalancingLoading={store.isBalancingLoading(service.name)}
              />
            )}
          />
        </ErrorZone>

        {selectedService && (
          <ServiceDetailsModal
            service={selectedService}
            onClose={() => store.setSelectedService(null)}
            onToggle={handleToggle}
            onDelete={handleDeleteService}
            onDeleteInstance={handleDeleteInstance}
            isToggleLoading={store.isToggleLoading}
            isDeleteServiceLoading={store.isDeleteServiceLoading}
            isInstanceDeleting={(instanceId) => deletingInstanceIds?.includes(instanceId) ?? false}
          />
        )}
      </div>
    </>
  );
});
