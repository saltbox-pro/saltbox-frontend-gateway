import { useEffect, useState } from "react";
import styles from "./general-сomponent.module.css";
import {
  ServiceInstanceOutput,
  ServiceSchemaOutput,
} from "@saltbox/saltbox-gateway-api-client";
import { apiGatewayStore } from "saltbox-gateway/store";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  List,
  Modal,
  Tag,
  Typography,
} from "antd";
import { PageHeader } from "@saltbox/saltbox-frontend-common";
import { HomeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const getServiceStatus = (
  instances: ServiceInstanceOutput[]
): "success" | "default" | "error" | "warning" => {
  if (!instances || instances.length === 0) {
    return "default";
  }
  const healthyInstances = instances.filter((i) => i.healthy).length;
  if (healthyInstances === instances.length) {
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
  const [selectedService, setSelectedService] =
    useState<ServiceSchemaOutput | null>(null);
  const [selectedInstance, setSelectedInstance] =
    useState<ServiceInstanceOutput | null>(null);

  useEffect(() => {
    apiGatewayStore.discoveryApi
      .getServicesApiDiscoveryServicesGet()
      .then((serv) => {
        setIsServicesLoading(false);
        setServices(serv);
      });
  }, []);

  return (
    <>
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
                      <Typography.Title
                        level={5}
                        className={styles.cardTitleText}
                        ellipsis
                      >
                        {service.title || service.name}
                      </Typography.Title>

                      <Badge status={getServiceStatus(service.instances)} />
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
                    contentStyle={{ textAlign: "right" }}
                  >
                    <Descriptions.Item label={t("general.vendor")}>
                      {service.vendor}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("general.type")}>
                      {service.type}
                    </Descriptions.Item>
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
            title={t("general.serviceTitle", {
              name: selectedService.title || selectedService.name,
            })}
            open={!!selectedService}
            onCancel={() => setSelectedService(null)}
            footer={null}
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
                    {selectedService.enabled
                      ? t("general.enabled")
                      : t("general.disabled")}
                  </Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
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
                    <Button
                      type="link"
                      onClick={() => setSelectedInstance(instance)}
                    >
                      {t("general.details")}
                    </Button>,
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
                      {instance.healthy
                        ? t("general.healthy")
                        : t("general.unhealthy")}
                    </Tag>
                    <Tag color={instance.enabled ? "blue" : "grey"}>
                      {instance.enabled
                        ? t("general.enabled")
                        : t("general.disabled")}
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
              <Descriptions.Item label={t("general.id")}>
                {selectedInstance.id}
              </Descriptions.Item>
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
                  {new Date(
                    selectedInstance.last_check * 1000
                  ).toLocaleString()}
                </Descriptions.Item>
              )}
              {selectedInstance.last_healthy && (
                <Descriptions.Item label={t("general.lastHealthy")}>
                  {new Date(
                    selectedInstance.last_healthy * 1000
                  ).toLocaleString()}
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
