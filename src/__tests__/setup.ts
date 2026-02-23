/**
 * Vitest global setup file.
 *
 * Provides minimal environment stubs so that modules importing
 * Tauri APIs or browser-only globals can be loaded in Node.
 */

// Stub `navigator.platform` for pathHelpers.ts platform detection
if (typeof globalThis.navigator === "undefined") {
  Object.defineProperty(globalThis, "navigator", {
    value: { platform: "Win32" },
    writable: true,
  });
}
