// @ts-expect-error Tauri is defined true or undefined
export const currentPlatform = !window.isTauri
	? "web"
	: await import("@tauri-apps/plugin-os").then((res) => res.type());

export const isTauri = currentPlatform !== "web" ? currentPlatform : false;

export const isDesktop = ["linux", "macos", "windows"].includes(
	currentPlatform,
);

export const isMobile = ["android", "ios"].includes(currentPlatform);

export const isWeb = currentPlatform === "web";
