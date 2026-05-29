import {
  EyeOutlined,
  GlobalOutlined,
  HddOutlined,
  NodeIndexOutlined,
  PoweroffOutlined,
  SettingOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { InfoDescriptions, PageHeader, Modal } from "@saltbox/saltbox-frontend-common";
import {
  ProxyBalancingStrategy,
  ServiceInstanceOutput,
  ServiceSchemaOutput,
  ServiceSchemaOutputTypeEnum,
} from "@saltbox/saltbox-gateway-api-client";
import {
  Badge,
  Button,
  Card,
  Collapse,
  Flex,
  List,
  Popconfirm,
  Select,
  Tag,
  Typography,
} from "antd";
import { TFunction } from "i18next";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { apiGatewayStore } from "saltbox-gateway/store";

import styles from "./general-сomponent.module.css";

const BALANCING_LABELS: Record<ProxyBalancingStrategy, string> = {
  [ProxyBalancingStrategy.Rand]: "Random",
  [ProxyBalancingStrategy.Rr]: "Round Robin",
  [ProxyBalancingStrategy.Wrr]: "Weighted RR",
};

const BALANCING_OPTIONS = (
  Object.entries(BALANCING_LABELS) as [ProxyBalancingStrategy, string][]
).map(([value, label]) => ({ value, label }));

const SERVICE_TYPE_COLORS: Record<ServiceSchemaOutputTypeEnum, string> = {
  [ServiceSchemaOutputTypeEnum.Official]: "blue",
  [ServiceSchemaOutputTypeEnum.ThirdParty]: "default",
};

const METHOD_COLORS: Record<string, string> = {
  GET: "blue",
  POST: "green",
  PUT: "orange",
  DELETE: "red",
  PATCH: "gold",
  HEAD: "purple",
  OPTIONS: "default",
};

const getServiceStatus = (service: ServiceSchemaOutput): "running" | "stopped" => {
  if (!service || !service.enabled || service.instances.length === 0) return "stopped";
  const healthyInstanceCount = service.instances.filter((i) => i.healthy).length;
  return healthyInstanceCount > 0 ? "running" : "stopped";
};

const getHealthyCount = (service: ServiceSchemaOutput): number => {
  return service.instances.filter((i) => i.healthy).length;
};

const formatRelativeTime = (timestamp: number, t: TFunction): string => {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return t("general.justNow");
  if (diff < 3600) return t("general.minutesAgo", { n: Math.floor(diff / 60) });
  if (diff < 86400) return t("general.hoursAgo", { n: Math.floor(diff / 3600) });
  return t("general.daysAgo", { n: Math.floor(diff / 86400) });
};

const ServiceStatusTag = ({ service }: { service: ServiceSchemaOutput }) => {
  const { t } = useTranslation();
  const status = getServiceStatus(service);
  return (
    <Tag color={status === "running" ? "green" : "red"}>
      {t(status === "running" ? "general.running" : "general.stopped")}
    </Tag>
  );
};

type ServiceCardProps = {
  service: ServiceSchemaOutput;
  onToggle: (service: ServiceSchemaOutput) => void;
  onDetails: (service: ServiceSchemaOutput) => void;
  onChangeBalancing: (service: ServiceSchemaOutput, strategy: ProxyBalancingStrategy) => void;
};

const ServiceCard = ({ service, onToggle, onDetails, onChangeBalancing }: ServiceCardProps) => {
  const { t } = useTranslation();
  const healthyInstanceCount = getHealthyCount(service);
  const totalInstance = service.instances.length;

  return (
    <List.Item>
      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleRow}>
            <div className={styles.cardTitle}>
              <HddOutlined className={styles.serviceIcon} />
              <Typography.Text strong className={styles.serviceTitle}>
                {service.title || service.name}
              </Typography.Text>
            </div>
            <ServiceStatusTag service={service} />
          </div>

          <div className={styles.cardTags}>
            <Tag>{service.name}</Tag>
            <Tag color={SERVICE_TYPE_COLORS[service.type]}>
              {service.type === ServiceSchemaOutputTypeEnum.Official
                ? t("general.official")
                : t("general.thirdParty")}
            </Tag>
          </div>

          {service.description && (
            <Typography.Paragraph
              type="secondary"
              className={styles.cardDescription}
              ellipsis={{ rows: 2 }}
            >
              {service.description}
            </Typography.Paragraph>
          )}
        </div>

        <div className={styles.cardBody}>
          <div className={styles.cardMeta}>
            <span>
              <Typography.Text type="secondary">{t("general.vendor")}: </Typography.Text>
              <Typography.Text>{service.vendor}</Typography.Text>
            </span>
            <span>
              <Typography.Text type="secondary">{t("general.instances")}: </Typography.Text>
              <Typography.Text>
                {healthyInstanceCount}/{totalInstance}
              </Typography.Text>
            </span>
          </div>

          <div
            className={styles.cardBalancing}
            role="presentation"
            onClick={(e) => e.stopPropagation()}
          >
            <Typography.Text type="secondary" className={styles.cardBalancingLabel}>
              {t("general.balancing")}:{" "}
            </Typography.Text>
            <Select
              size="small"
              value={service.load_balancing_strategy ?? ProxyBalancingStrategy.Rr}
              options={BALANCING_OPTIONS}
              disabled={totalInstance <= 1}
              onChange={(val) => onChangeBalancing(service, val)}
            />
          </div>
        </div>

        <div className={styles.cardActions}>
          <Button
            type="primary"
            danger
            icon={<PoweroffOutlined />}
            className={styles.btnDisable}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(service);
            }}
          >
            {service.enabled ? t("general.disable") : t("general.enable")}
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDetails(service);
            }}
          >
            {t("general.details")}
          </Button>
        </div>
      </Card>
    </List.Item>
  );
};

export const GeneralComponent = () => {
  const [services, setServices] = useState<ServiceSchemaOutput[]>([]);
  const { t } = useTranslation();
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceSchemaOutput | null>(null);
  const [modal, contextHolder] = Modal.useModal();

  const fetchServices = useCallback(() => {
    setIsServicesLoading(true);
    apiGatewayStore.discoveryApi
      .getServicesApiDiscoveryServicesGet()
      .then((serv) => {
        setServices(serv);
        setSelectedService((prev) =>
          prev ? (serv.find((s) => s.name === prev.name) ?? null) : null
        );
      })
      .finally(() => setIsServicesLoading(false));
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const toggleService = useCallback(
    (service: ServiceSchemaOutput) => {
      apiGatewayStore.discoveryApi
        .enableDisableServiceApiDiscoveryServicesServiceNameTogglePost({
          service_name: service.name,
          BodyEnableDisableServiceApiDiscoveryServicesServiceNameTogglePost: {
            enabled: !service.enabled,
          },
        })
        .then(fetchServices);
    },
    [fetchServices]
  );

  const deleteService = (service: ServiceSchemaOutput) => {
    apiGatewayStore.discoveryApi
      .removeServiceApiDiscoveryUnregisterServiceNameDelete({ service_name: service.name })
      .then(() => {
        setSelectedService(null);
        fetchServices();
      });
  };

  const deleteInstance = (service: ServiceSchemaOutput, instanceId: string) => {
    apiGatewayStore.discoveryApi
      .removeInstanceApiDiscoveryUnregisterServiceNameInstanceIdDelete({
        service_name: service.name,
        instance_id: instanceId,
      })
      .then(fetchServices);
  };

  const handleChangeBalancing = useCallback(
    (service: ServiceSchemaOutput, strategy: ProxyBalancingStrategy) => {
      apiGatewayStore.discoveryApi
        .changeBalancingStrategyApiDiscoveryServicesServiceNameChangeStrategyPatch({
          service_name: service.name,
          BodyChangeBalancingStrategyApiDiscoveryServicesServiceNameChangeStrategyPatch: {
            strategy,
          },
        })
        .then(fetchServices);
    },
    [fetchServices]
  );

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
          toggleService(service);
        },
      });
    },
    [modal, t, toggleService]
  );

  const basicInfoItems = selectedService
    ? [
        {
          key: "name",
          label: t("general.serviceName"),
          children: <Tag>{selectedService.name}</Tag>,
        },
        {
          key: "type",
          label: t("general.type"),
          children: (
            <Tag color={SERVICE_TYPE_COLORS[selectedService.type]}>
              {selectedService.type === ServiceSchemaOutputTypeEnum.Official
                ? t("general.official")
                : t("general.thirdParty")}
            </Tag>
          ),
        },
        {
          key: "vendor",
          label: t("general.vendor"),
          children: selectedService.vendor,
        },
        {
          key: "state",
          label: t("general.state"),
          children: <ServiceStatusTag service={selectedService} />,
        },
        {
          key: "balancing",
          label: t("general.balancing"),
          children:
            BALANCING_LABELS[selectedService.load_balancing_strategy ?? ProxyBalancingStrategy.Rr],
        },
      ]
    : [];

  return (
    <>
      {contextHolder}

      <PageHeader title={t("general.title")} />

      <div className={styles.container}>
        <div className={styles.toolbar}>
          <Button
            type="primary"
            icon={<SyncOutlined />}
            loading={isServicesLoading}
            onClick={fetchServices}
          >
            {t("general.refresh")}
          </Button>
        </div>

        <List
          loading={isServicesLoading}
          grid={{ gutter: 24, xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 3 }}
          dataSource={services}
          renderItem={(service) => (
            <ServiceCard
              service={service}
              onToggle={handleToggle}
              onDetails={setSelectedService}
              onChangeBalancing={handleChangeBalancing}
            />
          )}
        />

        {selectedService && (
          <Modal
            title={
              <span className={styles.modalTitle}>
                <HddOutlined />
                {selectedService.title || selectedService.name}
              </span>
            }
            open={!!selectedService}
            onCancel={() => {
              setSelectedService(null);
            }}
            footer={[
              <Button key="close" onClick={() => setSelectedService(null)}>
                {t("general.close")}
              </Button>,
              <Button
                key="delete"
                danger
                className={styles.btnDelete}
                onClick={() => {
                  modal.confirm({
                    title: t("general.deleteService"),
                    content: t("general.areYouSureDeleteService"),
                    okText: t("general.yes"),
                    okType: "danger",
                    cancelText: t("general.no"),
                    onOk() {
                      deleteService(selectedService);
                    },
                  });
                }}
              >
                {t("general.deleteService")}
              </Button>,
            ]}
            width={900}
          >
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <SettingOutlined />
                <Typography.Text strong>{t("general.basicInfo")}</Typography.Text>
              </div>
              <InfoDescriptions items={basicInfoItems} />
            </div>

            {selectedService.description && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <Typography.Text strong>{t("general.description")}</Typography.Text>
                </div>
                <Typography.Paragraph className={styles.descriptionText}>
                  {selectedService.description}
                </Typography.Paragraph>
              </div>
            )}

            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <NodeIndexOutlined />
                <Typography.Text strong>
                  {t("general.instancesCount", { count: selectedService.instances.length })}
                </Typography.Text>
              </div>
              <List
                dataSource={selectedService.instances}
                renderItem={(instance: ServiceInstanceOutput) => (
                  <List.Item>
                    <div className={styles.instanceCard}>
                      <div className={styles.instanceRow}>
                        <div className={styles.instanceInfo}>
                          <div className={styles.instanceTitleRow}>
                            <GlobalOutlined className={styles.instanceIcon} />
                            <div>
                              <div className={styles.instanceId}>(id: {instance.id})</div>
                              <div className={styles.instanceHost}>
                                {instance.host}:{instance.port}
                              </div>
                            </div>
                          </div>
                          {instance.last_check && (
                            <div className={styles.instanceTimestamp}>
                              {t("general.lastCheck")}:{" "}
                              {new Date(instance.last_check * 1000).toLocaleString()}
                              <span className={styles.instanceRelativeTime}>
                                ({formatRelativeTime(instance.last_check, t)})
                              </span>
                            </div>
                          )}
                          {instance.last_healthy && (
                            <div className={styles.instanceTimestamp}>
                              {t("general.lastHealthy")}:{" "}
                              {new Date(instance.last_healthy * 1000).toLocaleString()}
                              <span className={styles.instanceRelativeTime}>
                                ({formatRelativeTime(instance.last_healthy, t)})
                              </span>
                            </div>
                          )}
                        </div>

                        <div className={styles.instanceExtraInfo}>
                          <Flex align="center" gap={8}>
                            <Badge
                              status={instance.healthy ? "success" : "error"}
                              text={
                                <span
                                  className={
                                    instance.healthy ? styles.healthyStatus : styles.unhealthyStatus
                                  }
                                >
                                  {instance.healthy ? t("general.healthy") : t("general.unhealthy")}
                                </span>
                              }
                            />
                            <Flex align="center" gap={4}>
                              <Typography.Text type="secondary">API:</Typography.Text>
                              <Typography.Text>
                                {instance.version ?? t("general.na")}
                              </Typography.Text>
                            </Flex>
                          </Flex>
                          <Popconfirm
                            title={t("general.deleteInstance")}
                            description={t("general.areYouSureDeleteInstance")}
                            onConfirm={() => deleteInstance(selectedService, instance.id)}
                            okText={t("general.yes")}
                            cancelText={t("general.no")}
                          >
                            <Button
                              danger
                              className={styles.btnDelete}
                              disabled={selectedService.instances.length <= 1}
                            >
                              {t("general.delete")}
                            </Button>
                          </Popconfirm>
                        </div>
                      </div>

                      {(instance.endpoints?.length ?? 0) > 0 && (
                        <Collapse
                          size="small"
                          className={styles.endpointsCollapse}
                          items={[
                            {
                              key: "endpoints",
                              label: t("general.endpointsCount", {
                                count: instance.endpoints!.length,
                              }),
                              children: (
                                <div className={styles.endpointsSectionList}>
                                  {instance.endpoints!.map((endpoint, idx) => (
                                    <Tag
                                      color={
                                        METHOD_COLORS[endpoint.method.toUpperCase()] ?? "default"
                                      }
                                      key={idx}
                                      className={styles.endpointItem}
                                    >
                                      <div className={styles.endpointTopRow}>
                                        <Tag
                                          color={
                                            METHOD_COLORS[endpoint.method.toUpperCase()] ??
                                            "default"
                                          }
                                          className={styles.endpointMethodTag}
                                        >
                                          {endpoint.method.toUpperCase()}
                                        </Tag>
                                        <code className={styles.endpointPath}>{endpoint.path}</code>
                                        <span className={styles.endpointСacheInfo}>
                                          {endpoint.cache_ttl
                                            ? `${endpoint.cache_ttl}s cache`
                                            : "No cache"}
                                        </span>
                                      </div>
                                      {endpoint.summary && (
                                        <div className={styles.endpointSummary}>
                                          {endpoint.summary}
                                        </div>
                                      )}
                                      {endpoint.description && (
                                        <div className={styles.endpointDescription}>
                                          {endpoint.description}
                                        </div>
                                      )}
                                    </Tag>
                                  ))}
                                </div>
                              ),
                            },
                          ]}
                        />
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};
