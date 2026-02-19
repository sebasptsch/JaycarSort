// @ts-expect-error Tauri is defined true or undefined
export const isTauri = !!window.isTauri;
console.log({ isTauri });
