import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSettings } from "@/hooks/useSettings";
import { makeSettings } from "@/test/mockSettings";

import { ShortcutInput } from "../ShortcutInput";

vi.mock("@/hooks/useSettings");
const mockUseSettings = vi.mocked(useSettings);

// Lightweight stand-ins — real implementations make Tauri calls.
vi.mock("../GlobalShortcutInput", () => ({
  GlobalShortcutInput: () => <div data-testid="global-shortcut-input" />,
}));
vi.mock("../PhraserKeysShortcutInput", () => ({
  PhraserKeysShortcutInput: () => (
    <div data-testid="phraser-keys-shortcut-input" />
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ShortcutInput", () => {
  it("renders GlobalShortcutInput when keyboard_implementation is not set", () => {
    mockUseSettings.mockReturnValue(makeSettings({}));
    render(<ShortcutInput shortcutId="toggle_transcription" />);
    expect(screen.getByTestId("global-shortcut-input")).toBeInTheDocument();
    expect(
      screen.queryByTestId("phraser-keys-shortcut-input"),
    ).not.toBeInTheDocument();
  });

  it("renders GlobalShortcutInput when keyboard_implementation is 'tauri'", () => {
    mockUseSettings.mockReturnValue(
      makeSettings({ keyboard_implementation: "tauri" } as any),
    );
    render(<ShortcutInput shortcutId="toggle_transcription" />);
    expect(screen.getByTestId("global-shortcut-input")).toBeInTheDocument();
  });

  it("renders PhraserKeysShortcutInput when keyboard_implementation is 'phraser_keys'", () => {
    mockUseSettings.mockReturnValue(
      makeSettings({ keyboard_implementation: "phraser_keys" } as any),
    );
    render(<ShortcutInput shortcutId="toggle_transcription" />);
    expect(
      screen.getByTestId("phraser-keys-shortcut-input"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("global-shortcut-input"),
    ).not.toBeInTheDocument();
  });
});
