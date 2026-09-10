import { HddOutlined } from "@ant-design/icons";
import {
  ProxyBalancingStrategy,
  ServiceSchemaOutput,
  ServiceSchemaOutputTypeEnum,
} from "@saltbox/saltbox-gateway-api-client";
import { Card, List, Select, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import styles from "./service-card.module.css";

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

const getServiceStatus = (service: ServiceSchemaOutput): "running" | "stopped" => {
  if (!service.enabled || service.instances.length === 0) {
    return "stopped";
  }
  return service.instances.filter((i) => i.healthy).length > 0 ? "running" : "stopped";
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

export type ServiceCardProps = {
  service: ServiceSchemaOutput;
  onDetails: (service: ServiceSchemaOutput) => void;
  onChangeBalancing: (
    service: ServiceSchemaOutput,
    strategy: ProxyBalancingStrategy
  ) => void | Promise<unknown>;
  isChangeBalancingLoading?: boolean;
};

export const ServiceCard = ({
  service,
  onDetails,
  onChangeBalancing,
  isChangeBalancingLoading,
}: ServiceCardProps) => {
  const { t } = useTranslation();
  const healthyInstanceCount = service.instances.filter((i) => i.healthy).length;
  const totalInstance = service.instances.length;

  return (
    <List.Item>
      <Card className={`${styles.card} ${styles.cardClickable}`} onClick={() => onDetails(service)}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleRow}>
            <div className={styles.cardTitle}>
              <HddOutlined className={styles.cardIcon} />
              <Typography.Text strong className={styles.cardTitleText}>
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
                : t("general.third-party")}
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
              disabled={totalInstance <= 1 || isChangeBalancingLoading}
              loading={isChangeBalancingLoading}
              onChange={(val) => onChangeBalancing(service, val)}
            />
          </div>
        </div>
      </Card>
    </List.Item>
  );
};
