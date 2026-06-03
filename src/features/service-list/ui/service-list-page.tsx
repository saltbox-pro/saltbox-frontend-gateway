import { SyncOutlined } from "@ant-design/icons";
import { Modal, PageHeader } from "@saltbox/saltbox-frontend-common";
import { ServiceSchemaOutput } from "@saltbox/saltbox-gateway-api-client";
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

  const handleToggle = useCallback(
    (service: ServiceSchemaOutput) => {
      modal.confirm({
        title: service.enabled ? t("general.disableService") : t("general.enableService"),
        content: service.enabled
          ? t("general.areYouSureDisableService")
          : t("general.areYouSureEnableService"),
        okText: t("general.yes"),
        okType: "danger",
        cancelText: t("general.no"),
        onOk() {
          store.toggleService(service);
        },
      });
    },
    [modal, t, store]
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

        <List
          loading={store.isLoading}
          grid={{ gutter: 24, xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 3 }}
          dataSource={store.services}
          renderItem={(service) => (
            <ServiceCard
              service={service}
              onDetails={store.setSelectedService}
              onChangeBalancing={store.changeBalancing}
            />
          )}
        />

        {store.selectedService && (
          <ServiceDetailsModal
            service={store.selectedService}
            onClose={() => store.setSelectedService(null)}
            onToggle={handleToggle}
            onDelete={store.deleteService}
            onDeleteInstance={store.deleteInstance}
          />
        )}
      </div>
    </>
  );
});
