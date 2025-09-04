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
                    <Descriptions.Item label="Vendor">
                      {service.vendor}
                    </Descriptions.Item>
                    <Descriptions.Item label="Type">
                      {service.type}
                    </Descriptions.Item>
                    <Descriptions.Item label="Instances">
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
            title={`Service: ${selectedService.title || selectedService.name}`}
            open={!!selectedService}
            onCancel={() => setSelectedService(null)}
            footer={null}
            width={900}
          >
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Vendor">
                {selectedService.vendor}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                {selectedService.type}
              </Descriptions.Item>
              {selectedService.enabled !== undefined && (
                <Descriptions.Item label="Enabled">
                  <Tag color={selectedService.enabled ? "blue" : "grey"}>
                    {selectedService.enabled ? "Enabled" : "Disabled"}
                  </Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
            <h4 className={styles.instancesHeader}>
              Instances ({selectedService.instances?.length || 0})
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
                      Details
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={`${instance.host}:${instance.port}`}
                    description={`Version: ${instance.version || "N/A"}`}
                  />
                  <div>
                    <Tag color={instance.healthy ? "green" : "red"}>
                      {instance.healthy ? "Healthy" : "Unhealthy"}
                    </Tag>
                    <Tag color={instance.enabled ? "blue" : "grey"}>
                      {instance.enabled ? "Enabled" : "Disabled"}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </Modal>
        )}

        {selectedInstance && (
          <Modal
            title={`Instance: ${selectedInstance.id}`}
            open={!!selectedInstance}
            onCancel={() => setSelectedInstance(null)}
            footer={null}
            width={700}
          >
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="ID">
                {selectedInstance.id}
              </Descriptions.Item>
              <Descriptions.Item label="Host">
                {selectedInstance.host}
              </Descriptions.Item>
              <Descriptions.Item label="Port">
                {selectedInstance.port}
              </Descriptions.Item>
              {selectedInstance.version && (
                <Descriptions.Item label="Version">
                  {selectedInstance.version}
                </Descriptions.Item>
              )}
              {selectedInstance.last_check && (
                <Descriptions.Item label="Last Check">
                  {new Date(
                    selectedInstance.last_check * 1000
                  ).toLocaleString()}
                </Descriptions.Item>
              )}
              {selectedInstance.last_healthy && (
                <Descriptions.Item label="Last Healthy">
                  {new Date(
                    selectedInstance.last_healthy * 1000
                  ).toLocaleString()}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Endpoints">
                {selectedInstance.endpoints?.length || 0}
              </Descriptions.Item>
            </Descriptions>
          </Modal>
        )}
      </div>
    </>
  );
};
