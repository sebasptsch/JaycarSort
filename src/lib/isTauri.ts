import type { OsType } from "@tauri-apps/plugin-os";

// @ts-expect-error Tauri is defined true or undefined
export const isTauri = !!window.isTauri;

export const currentPlatform = !isTauri
	? "web"
	: (import.meta.env.TAURI_ENV_PLATFORM as OsType);

export const isDesktop = ["linux", "macos", "windows"].includes(
	currentPlatform,
);

export const isMobile = ["android", "ios"].includes(currentPlatform);

export const isWeb = currentPlatform === "web";
