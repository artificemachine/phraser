import React from "react";
import { useTranslation } from "react-i18next";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { SettingContainer } from "../../ui/SettingContainer";
import { Dropdown } from "../../ui/Dropdown";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { useSettings } from "../../../hooks/useSettings";
import { useModelStore } from "../../../stores/modelStore";
import type { ModelInfo } from "@/bindings";

const THRESHOLD_OPTIONS = [5, 10, 15, 20, 30, 60];

export const LongAudioModelSettings: React.FC = () => {
  const { t } = useTranslation();
  const { getSetting, updateSetting } = useSettings();
  const { models, downloadModel, isModelDownloading } = useModelStore();

  const downloadedModels = models.filter((m: ModelInfo) => m.is_downloaded);
  const longAudioModel = getSetting("long_audio_model") ?? null;
  const threshold = getSetting("long_audio_threshold_seconds") ?? 10;

  // A configured model may not be downloaded — new installs default this setting
  // to Whisper Turbo, which the user has not necessarily fetched. Keep it listed
  // so the dropdown reflects the stored value instead of rendering blank.
  const configuredModel = longAudioModel
    ? models.find((m: ModelInfo) => m.id === longAudioModel)
    : undefined;
  const missingModel =
    configuredModel && !configuredModel.is_downloaded
      ? configuredModel
      : undefined;

  const modelOptions = [
    { value: "", label: t("settings.longAudioModel.disabled") },
    ...downloadedModels.map((m: ModelInfo) => ({
      value: m.id,
      label: m.name,
    })),
    ...(missingModel
      ? [
          {
            value: missingModel.id,
            label: t("settings.longAudioModel.notDownloadedOption", {
              name: missingModel.name,
            }),
          },
        ]
      : []),
  ];

  const thresholdOptions = THRESHOLD_OPTIONS.map((v) => ({
    value: String(v),
    label: t("settings.longAudioModel.seconds", { value: v }),
  }));

  const handleModelSelect = async (value: string) => {
    await updateSetting("long_audio_model", value === "" ? null : value);
  };

  const handleThresholdSelect = async (value: string) => {
    await updateSetting("long_audio_threshold_seconds", Number(value));
  };

  const handleDownloadMissing = async () => {
    if (missingModel) {
      await downloadModel(missingModel.id);
    }
  };

  return (
    <SettingsGroup
      title={t("settings.longAudioModel.title")}
      description={t("settings.longAudioModel.description")}
    >
      <SettingContainer
        title={t("settings.longAudioModel.modelLabel")}
        description={t("settings.longAudioModel.modelDescription")}
        descriptionMode="tooltip"
        grouped={true}
      >
        <Dropdown
          options={modelOptions}
          selectedValue={longAudioModel ?? ""}
          onSelect={handleModelSelect}
        />
      </SettingContainer>
      {missingModel && (
        <Alert variant="warning" contained={true}>
          {/* Alert renders children inside a <p>, so keep this subtree inline-only. */}
          <span className="flex items-center justify-between gap-3 w-full">
            <span>{t("settings.longAudioModel.notDownloadedWarning")}</span>
            <Button
              variant="primary-soft"
              size="sm"
              className="shrink-0"
              onClick={handleDownloadMissing}
              disabled={isModelDownloading(missingModel.id)}
            >
              {isModelDownloading(missingModel.id)
                ? t("settings.longAudioModel.downloading")
                : t("settings.longAudioModel.downloadModel", {
                    size: missingModel.size_mb,
                  })}
            </Button>
          </span>
        </Alert>
      )}
      {longAudioModel && (
        <SettingContainer
          title={t("settings.longAudioModel.thresholdLabel")}
          description={t("settings.longAudioModel.thresholdDescription")}
          descriptionMode="tooltip"
          grouped={true}
        >
          <Dropdown
            options={thresholdOptions}
            selectedValue={String(threshold)}
            onSelect={handleThresholdSelect}
          />
        </SettingContainer>
      )}
    </SettingsGroup>
  );
};
