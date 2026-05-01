import React from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "../ui/Dropdown";
import { SettingContainer } from "../ui/SettingContainer";
import { useSettings } from "../../hooks/useSettings";
import { AudioFormat } from "@/bindings";

interface AudioFormatSelectorProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

export const AudioFormatSelector: React.FC<AudioFormatSelectorProps> =
  React.memo(({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting, isUpdating } = useSettings();

    const selectedFormat = (getSetting("audio_format") as string) || "wav";

    const handleFormatSelect = async (format: string) => {
      await updateSetting("audio_format", format as AudioFormat);
    };

    const formatOptions = [
      { value: "wav", label: t("settings.advanced.audioFormat.wav") },
      { value: "mp3", label: t("settings.advanced.audioFormat.mp3") },
    ];

    return (
      <SettingContainer
        title={t("settings.advanced.audioFormat.title")}
        description={t("settings.advanced.audioFormat.description")}
        descriptionMode={descriptionMode}
        grouped={grouped}
      >
        <Dropdown
          options={formatOptions}
          selectedValue={selectedFormat}
          onSelect={handleFormatSelect}
          placeholder={t("settings.advanced.audioFormat.title")}
          disabled={isUpdating("audio_format")}
        />
      </SettingContainer>
    );
  });

AudioFormatSelector.displayName = "AudioFormatSelector";
