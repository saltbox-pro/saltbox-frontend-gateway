import { HddOutlined, NodeIndexOutlined, SettingOutlined } from "@ant-design/icons";
import { Dropdown, InfoDescriptions, Modal } from "@saltbox/saltbox-frontend-common";
import {
  ProxyBalancingStrategy,
  ServiceSchemaOutput,
  ServiceSchemaOutputTypeEnum,
} from "@saltbox/saltbox-gateway-api-client";
import { Button, List, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import styles from "./service-details-modal.module.css";
import { ServiceInstanceItem } from "./service-instance-item";

const BALANCING_LABELS: Record<ProxyBalancingStrategy, string> = {
  [ProxyBalancingStrategy.Rand]: "Random",
  [ProxyBalancingStrategy.Rr]: "Round Robin",
  [ProxyBalancingStrategy.Wrr]: "Weighted RR",
};

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

type ServiceDetailsModalProps = {
  service: ServiceSchemaOutput;
  onClose: () => void;
  onToggle: (service: ServiceSchemaOutput) => void;
  onDelete: (service: ServiceSchemaOutput) => void | Promise<unknown>;
  onDeleteInstance: (service: ServiceSchemaOutput, instanceId: string) => void | Promise<unknown>;
  isToggleLoading?: boolean;
  isDeleteServiceLoading?: boolean;
  isInstanceDeleting?: (instanceId: string) => boolean;
};

export const ServiceDetailsModal = ({
  service,
  onClose,
  onToggle,
  onDelete,
  onDeleteInstance,
  isToggleLoading,
  isDeleteServiceLoading,
  isInstanceDeleting,
}: ServiceDetailsModalProps) => {
  const { t } = useTranslation();
  const [modal, contextHolder] = Modal.useModal();

  const basicInfoItems = [
    {
      key: "name",
      label: t("general.service-name"),
      children: <Tag>{service.name}</Tag>,
    },
    {
      key: "type",
      label: t("general.type"),
      children: (
        <Tag color={SERVICE_TYPE_COLORS[service.type]}>
          {service.type === ServiceSchemaOutputTypeEnum.Official
            ? t("general.official")
            : t("general.third-party")}
        </Tag>
      ),
    },
    {
      key: "vendor",
      label: t("general.vendor"),
      children: service.vendor,
    },
    {
      key: "state",
      label: t("general.state"),
      children: <ServiceStatusTag service={service} />,
    },
    {
      key: "balancing",
      label: t("general.balancing"),
      children: BALANCING_LABELS[service.load_balancing_strategy ?? ProxyBalancingStrategy.Rr],
    },
  ];

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <span className={styles.modalTitle}>
            <HddOutlined />
            {service.title || service.name}
          </span>
        }
        open
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            {t("general.close")}
          </Button>,
        ]}
        width={900}
      >
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Typography.Text strong>{t("general.basic-info")}</Typography.Text>
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: "toggle",
                    label: service.enabled ? t("general.disable") : t("general.enable"),
                    className: styles.sectionTitleActionsToggle,
                    disabled: isToggleLoading || isDeleteServiceLoading,
                    onClick: () => onToggle(service),
                  },
                  {
                    key: "delete",
                    label: t("general.delete-service"),
                    className: styles.sectionTitleActionsDelete,
                    disabled: isToggleLoading || isDeleteServiceLoading,
                    onClick: () => {
                      modal.confirm({
                        title: t("general.delete-service"),
                        content: t("general.are-you-sure-delete-service"),
                        okText: t("general.delete"),
                        okType: "danger",
                        okButtonProps: {
                          danger: true,
                          type: "primary",
                        },
                        cancelText: t("general.cancel"),
                        onOk() {
                          return onDelete(service);
                        },
                      });
                    },
                  },
                ],
              }}
            >
              <Button
                icon={<SettingOutlined />}
                loading={isToggleLoading || isDeleteServiceLoading}
              />
            </Dropdown>
          </div>
          <InfoDescriptions items={basicInfoItems} />
        </div>

        {service.description && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <Typography.Text strong>{t("general.description")}</Typography.Text>
            </div>
            <Typography.Paragraph className={styles.sectionDescription}>
              {service.description}
            </Typography.Paragraph>
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleGroup}>
              <NodeIndexOutlined />
              <Typography.Text strong>
                {t("general.instances-count", { count: service.instances.length })}
              </Typography.Text>
            </div>
          </div>
          <List
            dataSource={service.instances}
            renderItem={(instance) => (
              <List.Item>
                <ServiceInstanceItem
                  instance={instance}
                  isOnly={service.instances.length <= 1}
                  onDelete={() => onDeleteInstance(service, instance.id)}
                  isDeleting={isInstanceDeleting?.(instance.id)}
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </>
  );
};
