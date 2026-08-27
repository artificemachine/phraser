import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSettings } from "@/hooks/useSettings";
import { useModelStore } from "@/stores/modelStore";
import { makeSettings } from "@/test/mockSettings";
import type { ModelInfo } from "@/bindings";

import { LongAudioModelSettings } from "../general/LongAudioModelSettings";

vi.mock("@/hooks/useSettings");
vi.mock("@/stores/modelStore");

const mockUseSettings = vi.mocked(useSettings);
const mockUseModelStore = vi.mocked(useModelStore);

const makeModel = (overrides: Partial<ModelInfo>): ModelInfo =>
  ({
    id: "turbo",
    name: "Whisper Turbo",
    description: "",
    filename: "ggml-large-v3-turbo.bin",
    url: null,
    size_mb: 1600,
    is_downloaded: false,
    is_downloading: false,
    partial_size: 0,
    is_directory: false,
    engine_type: "Whisper",
    accuracy_score: 0.8,
    speed_score: 0.4,
    supports_translation: false,
    is_recommended: true,
    supported_languages: [],
    is_custom: false,
    ...overrides,
  }) as unknown as ModelInfo;

const PARAKEET = makeModel({
  id: "parakeet-tdt-0.6b-v3",
  name: "Parakeet V3",
  is_downloaded: true,
});
const TURBO_MISSING = makeModel({ id: "turbo", is_downloaded: false });
const TURBO_PRESENT = makeModel({ id: "turbo", is_downloaded: true });

const mockStore = (models: ModelInfo[], downloadModel = vi.fn()) => {
  mockUseModelStore.mockReturnValue({
    models,
    downloadModel,
    isModelDownloading: () => false,
  } as unknown as ReturnType<typeof useModelStore>);
  return downloadModel;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LongAudioModelSettings — missing model warning", () => {
  it("warns when the configured long-audio model is not downloaded", () => {
    mockUseSettings.mockReturnValue(
      makeSettings({ long_audio_model: "turbo" }),
    );
    mockStore([PARAKEET, TURBO_MISSING]);

    render(<LongAudioModelSettings />);

    expect(
      screen.getByText("settings.longAudioModel.notDownloadedWarning"),
    ).toBeInTheDocument();
  });

  it("offers a download button for the missing model", async () => {
    mockUseSettings.mockReturnValue(
      makeSettings({ long_audio_model: "turbo" }),
    );
    const downloadModel = mockStore([PARAKEET, TURBO_MISSING]);

    render(<LongAudioModelSettings />);
    await userEvent.click(
      screen.getByRole("button", {
        name: /settings.longAudioModel.downloadModel/,
      }),
    );

    expect(downloadModel).toHaveBeenCalledWith("turbo");
  });

  it("keeps the missing model selectable in the dropdown", () => {
    mockUseSettings.mockReturnValue(
      makeSettings({ long_audio_model: "turbo" }),
    );
    mockStore([PARAKEET, TURBO_MISSING]);

    render(<LongAudioModelSettings />);

    // `t` is mocked to return the key, so the interpolated model name is not
    // rendered — assert on the key that only appears for a missing model.
    expect(
      screen.getByRole("button", {
        name: /settings.longAudioModel.notDownloadedOption/,
      }),
    ).toBeInTheDocument();
  });

  it("shows no warning once the model is downloaded", () => {
    mockUseSettings.mockReturnValue(
      makeSettings({ long_audio_model: "turbo" }),
    );
    mockStore([PARAKEET, TURBO_PRESENT]);

    render(<LongAudioModelSettings />);

    expect(
      screen.queryByText("settings.longAudioModel.notDownloadedWarning"),
    ).not.toBeInTheDocument();
  });

  it("shows no warning when the feature is disabled", () => {
    mockUseSettings.mockReturnValue(makeSettings({ long_audio_model: null }));
    mockStore([PARAKEET, TURBO_MISSING]);

    render(<LongAudioModelSettings />);

    expect(
      screen.queryByText("settings.longAudioModel.notDownloadedWarning"),
    ).not.toBeInTheDocument();
  });
});
