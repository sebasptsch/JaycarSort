// @ts-expect-error Tauri is defined true or undefined
export const isTauri = !!window.isTauri;

export const getCurrentPlatform = async () => {
	if (!isTauri) return "web";

	const { type } = await import("@tauri-apps/plugin-os");

	return type();
};

export const getTauriPlatform = async () => {
	const currentPlatform = await getCurrentPlatform();
	return currentPlatform !== "web" ? currentPlatform : false;
};

export const getIsDesktop = async () =>
	["linux", "macos", "windows"].includes(await getCurrentPlatform());

export const getIsMobile = async () =>
	["android", "ios"].includes(await getCurrentPlatform());

export const getIsWeb = async () => (await getCurrentPlatform()) === "web";
