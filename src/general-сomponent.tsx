import { HomeOutlined } from "@ant-design/icons";
import { PageHeader, Modal, Dropdown } from "@saltbox/saltbox-frontend-common";
import { ServiceInstanceOutput, ServiceSchemaOutput } from "@saltbox/saltbox-gateway-api-client";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  List,
  Popconfirm,
  Tag,
  Typography,
} from "antd";
import { ComponentProps, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { apiGatewayStore } from "saltbox-gateway/store";

import styles from "./general-сomponent.module.css";

type MenuItems = ComponentProps<typeof Dropdown>["menu"]["items"];

const getServiceStatus = (
  service: ServiceSchemaOutput
): "success" | "default" | "error" | "warning" => {
  if (!service || service.instances.length === 0 || service.enabled === false) {
    return "default";
  }
  const healthyInstances = service.instances.filter((i) => i.healthy).length;
  if (healthyInstances === service.instances.length) {
    return "success";
  }
  if (healthyInstances === 0) {
    return "error";
  }
  return "warning";
};
export const GeneralComponent = () => {
  const [services, setServices] = useState<ServiceSchemaOutput[]>([]);
  const { t } = useTranslation();
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceSchemaOutput | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<ServiceInstanceOutput | null>(null);
  const [modal, contextHolder] = Modal.useModal();

  const fetchServices = () => {
    setIsServicesLoading(true);
    apiGatewayStore.discoveryApi
      .getServicesApiDiscoveryServicesGet()
      .then((serv) => {
        setServices(serv);
        if (selectedService) {
          const newSelectedService = serv.find((s) => s.name === selectedService.name);
          setSelectedService(newSelectedService || null);
        }
      })
      .finally(() => {
        setIsServicesLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const deleteService = () => {
    if (!selectedService) return;
    apiGatewayStore.discoveryApi
      .removeServiceApiDiscoveryUnregisterServiceNameDelete({
        service_name: selectedService.name,
      })
      .then(() => {
        window.location.reload();
      });
  };

  const toggleService = () => {
    if (!selectedService) return;
    apiGatewayStore.discoveryApi
      .enableDisableServiceApiDiscoveryServicesServiceNameTogglePost({
        service_name: selectedService.name,
        BodyEnableDisableServiceApiDiscoveryServicesServiceNameTogglePost: {
          enabled: !selectedService.enabled,
        },
      })
      .then(() => {
        window.location.reload();
      });
  };

  const deleteInstance = (instanceId: string) => {
    if (!selectedService) return;
    apiGatewayStore.discoveryApi
      .removeInstanceApiDiscoveryUnregisterServiceNameInstanceIdDelete({
        service_name: selectedService.name,
        instance_id: instanceId,
      })
      .then(() => {
        fetchServices();
      });
  };

  const serviceActionItems: MenuItems = [
    {
      key: "toggle",
      label: selectedService?.enabled ? t("general.disable") : t("general.enable"),
      onClick: () => {
        modal.confirm({
          title: selectedService?.enabled
            ? t("general.disableService")
            : t("general.enableService"),
          content: selectedService?.enabled
            ? t("general.areYouSureDisableService")
            : t("general.areYouSureEnableService"),
          okText: t("general.yes"),
          okType: "danger",
          cancelText: t("general.no"),
          onOk() {
            toggleService();
          },
        });
      },
    },
    {
      key: "delete",
      label: t("general.delete"),
      danger: true,
      onClick: () => {
        modal.confirm({
          title: t("general.deleteService"),
          content: t("general.areYouSureDeleteService"),
          okText: t("general.yes"),
          okType: "danger",
          cancelText: t("general.no"),
          onOk() {
            deleteService();
          },
        });
      },
    },
  ];

  return (
    <>
      {contextHolder}
      <Breadcrumb
        items={[
          {
            href: "/",
            title: <HomeOutlined />,
          },
          {
            title: t("general.title"),
          },
        ]}
      />
      <PageHeader title={t("general.title")}></PageHeader>
      <div className={styles.container}>
        <List
          loading={isServicesLoading}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 3,
            xl: 4,
            xxl: 5,
          }}
          dataSource={services}
          renderItem={(service) => (
            <List.Item>
              <Card
                hoverable
                className={styles.card}
                onClick={() => setSelectedService(service)}
                title={
                  <div className={styles.cardTitle}>
                    <div className={styles.cardTitleHeader}>
                      <Typography.Title level={5} className={styles.cardTitleText} ellipsis>
                        {service.title || service.name}
                      </Typography.Title>

                      <Badge status={getServiceStatus(service)} />
                    </div>

                    <Typography.Paragraph
                      type="secondary"
                      className={styles.cardDescription}
                      ellipsis={{ rows: 2 }}
                    >
                      {service.description}
                    </Typography.Paragraph>
                  </div>
                }
              >
                <div className={styles.cardContent}>
                  <Descriptions
                    bordered
                    column={1}
                    size="small"
                    className={styles.noBorder}
                    styles={{ content: { textAlign: "right" } }}
                  >
                    <Descriptions.Item label={t("general.vendor")}>
                      {service.vendor}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("general.type")}>{service.type}</Descriptions.Item>
                    <Descriptions.Item label={t("general.instances")}>
                      {service.instances?.length || 0}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </Card>
            </List.Item>
          )}
        />

        {selectedService && (
          <Modal
            loading={isServicesLoading}
            title={t("general.serviceTitle", {
              name: selectedService.title || selectedService.name,
            })}
            open={!!selectedService}
            onCancel={() => setSelectedService(null)}
            footer={[
              <Button key="back" onClick={() => setSelectedService(null)}>
                {t("general.close")}
              </Button>,
            ]}
            width={900}
          >
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={t("general.vendor")}>
                {selectedService.vendor}
              </Descriptions.Item>
              <Descriptions.Item label={t("general.type")}>
                {selectedService.type}
              </Descriptions.Item>
              {selectedService.enabled !== undefined && (
                <Descriptions.Item label={t("general.enabled")}>
                  <Tag color={selectedService.enabled ? "blue" : "grey"}>
                    {selectedService.enabled ? t("general.enabled") : t("general.disabled")}
                  </Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
            <div style={{ paddingTop: "16px", textAlign: "right" }}>
              <Dropdown menu={{ items: serviceActionItems }} trigger={["click"]}>
                <Button>{t("general.actions")}</Button>
              </Dropdown>
            </div>
            <h4 className={styles.instancesHeader}>
              {t("general.instancesCount", {
                count: selectedService.instances?.length || 0,
              })}
            </h4>
            <List
              dataSource={selectedService.instances}
              renderItem={(instance) => (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => setSelectedInstance(instance)}>
                      {t("general.details")}
                    </Button>,
                    selectedService.instances.length > 1 && (
                      <Popconfirm
                        title={t("general.deleteInstance")}
                        description={t("general.areYouSureDeleteInstance")}
                        onConfirm={() => deleteInstance(instance.id)}
                        okText={t("general.yes")}
                        cancelText={t("general.no")}
                      >
                        <Button type="link" danger>
                          {t("general.delete")}
                        </Button>
                      </Popconfirm>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    title={`${instance.host}:${instance.port}`}
                    description={t("general.versionWithValue", {
                      version: instance.version || t("general.na"),
                    })}
                  />
                  <div>
                    <Tag color={instance.healthy ? "green" : "red"}>
                      {instance.healthy ? t("general.healthy") : t("general.unhealthy")}
                    </Tag>
                    <Tag color={instance.enabled ? "blue" : "grey"}>
                      {instance.enabled ? t("general.enabled") : t("general.disabled")}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </Modal>
        )}

        {selectedInstance && (
          <Modal
            title={t("general.instanceTitle", { id: selectedInstance.id })}
            open={!!selectedInstance}
            onCancel={() => setSelectedInstance(null)}
            footer={null}
            width={700}
          >
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={t("general.id")}>{selectedInstance.id}</Descriptions.Item>
              <Descriptions.Item label={t("general.host")}>
                {selectedInstance.host}
              </Descriptions.Item>
              <Descriptions.Item label={t("general.port")}>
                {selectedInstance.port}
              </Descriptions.Item>
              {selectedInstance.version && (
                <Descriptions.Item label={t("general.version")}>
                  {selectedInstance.version}
                </Descriptions.Item>
              )}
              {selectedInstance.last_check && (
                <Descriptions.Item label={t("general.lastCheck")}>
                  {new Date(selectedInstance.last_check * 1000).toLocaleString()}
                </Descriptions.Item>
              )}
              {selectedInstance.last_healthy && (
                <Descriptions.Item label={t("general.lastHealthy")}>
                  {new Date(selectedInstance.last_healthy * 1000).toLocaleString()}
                </Descriptions.Item>
              )}
              <Descriptions.Item label={t("general.endpoints")}>
                {selectedInstance.endpoints?.length || 0}
              </Descriptions.Item>
            </Descriptions>
          </Modal>
        )}
      </div>
    </>
  );
};
