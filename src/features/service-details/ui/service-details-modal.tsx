import { HddOutlined, NodeIndexOutlined, SettingOutlined } from "@ant-design/icons";
import { Dropdown, InfoDescriptions, Modal } from "@saltbox/saltbox-frontend-common";
import {
  ProxyBalancingStrategy,
  ServiceSchemaOutput,
  ServiceSchemaOutputTypeEnum,
} from "@saltbox/saltbox-gateway-api-client";
import { Button, List, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { ServiceInstanceItem } from "./service-instance-item";

import styles from "./service-details-modal.module.css";

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
  onDelete: (service: ServiceSchemaOutput) => void;
  onDeleteInstance: (service: ServiceSchemaOutput, instanceId: string) => void;
};

export const ServiceDetailsModal = ({
  service,
  onClose,
  onToggle,
  onDelete,
  onDeleteInstance,
}: ServiceDetailsModalProps) => {
  const { t } = useTranslation();
  const [modal, contextHolder] = Modal.useModal();

  const basicInfoItems = [
    {
      key: "name",
      label: t("general.serviceName"),
      children: <Tag>{service.name}</Tag>,
    },
    {
      key: "type",
      label: t("general.type"),
      children: (
        <Tag color={SERVICE_TYPE_COLORS[service.type]}>
          {service.type === ServiceSchemaOutputTypeEnum.Official
            ? t("general.official")
            : t("general.thirdParty")}
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
            <Typography.Text strong>{t("general.basicInfo")}</Typography.Text>
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: "toggle",
                    label: service.enabled ? t("general.disable") : t("general.enable"),
                    className: styles.sectionTitleActionsToggle,
                    onClick: () => onToggle(service),
                  },
                  {
                    key: "delete",
                    label: t("general.deleteService"),
                    className: styles.sectionTitleActionsDelete,
                    onClick: () => {
                      modal.confirm({
                        title: t("general.deleteService"),
                        content: t("general.areYouSureDeleteService"),
                        okText: t("general.yes"),
                        okType: "danger",
                        cancelText: t("general.no"),
                        onOk() {
                          onDelete(service);
                        },
                      });
                    },
                  },
                ],
              }}
            >
              <Button icon={<SettingOutlined />} />
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
                {t("general.instancesCount", { count: service.instances.length })}
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
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </>
  );
};
