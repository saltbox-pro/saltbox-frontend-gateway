import { GlobalOutlined } from "@ant-design/icons";
import { ServiceInstanceOutput } from "@saltbox/saltbox-gateway-api-client";
import { Badge, Button, Flex, Popconfirm, Typography } from "antd";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import styles from "./service-instance-item.module.css";

const formatRelativeTime = (timestamp: number, t: TFunction): string => {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) {
    return t("general.just-now");
  }
  if (diff < 3600) {
    return t("general.minutes-ago", { n: Math.floor(diff / 60) });
  }
  if (diff < 86400) {
    return t("general.hours-ago", { n: Math.floor(diff / 3600) });
  }
  return t("general.days-ago", { n: Math.floor(diff / 86400) });
};

type ServiceInstanceItemProps = {
  instance: ServiceInstanceOutput;
  isOnly: boolean;
  onDelete: () => void;
};

export const ServiceInstanceItem = ({ instance, isOnly, onDelete }: ServiceInstanceItemProps) => {
  const { t } = useTranslation();

  return (
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
            {t("general.last-check")}: {new Date(instance.last_check * 1000).toLocaleString()}
            <span className={styles.instanceRelativeTime}>
              ({formatRelativeTime(instance.last_check, t)})
            </span>
          </div>
        )}
        {instance.last_healthy && (
          <div className={styles.instanceTimestamp}>
            {t("general.last-healthy")}: {new Date(instance.last_healthy * 1000).toLocaleString()}
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
                  instance.healthy ? styles.instanceHealthyStatus : styles.instanceUnhealthyStatus
                }
              >
                {instance.healthy ? t("general.healthy") : t("general.unhealthy")}
              </span>
            }
          />
          <Flex align="center" gap={4}>
            <Typography.Text type="secondary">API:</Typography.Text>
            <Typography.Text>{instance.version ?? t("general.na")}</Typography.Text>
          </Flex>
        </Flex>
        <Popconfirm
          title={t("general.delete-instance")}
          description={t("general.are-you-sure-delete-instance")}
          onConfirm={onDelete}
          okText={t("general.yes")}
          cancelText={t("general.no")}
        >
          <Button danger className={styles.instanceBtnDelete} disabled={isOnly}>
            {t("general.delete")}
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};
