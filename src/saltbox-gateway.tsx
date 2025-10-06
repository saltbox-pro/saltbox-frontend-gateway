// CRITICAL: Coordinate shared scope between independently loaded bundles
// Root-config and gateway are loaded as separate webpack bundles,
// each with their own __webpack_share_scopes__. We need to merge them.

// Initialize gateway's sharing
// @ts-ignore
await __webpack_init_sharing__("default");

// Check if there's already a global shared scope (from root-config)
// @ts-ignore
if (!window.__webpack_share_registry__) {
  // @ts-ignore
  window.__webpack_share_registry__ = __webpack_share_scopes__;
} else {
  // Merge root's shared scope into gateway's scope
  // @ts-ignore
  const rootShared = window.__webpack_share_registry__.default;
  // @ts-ignore
  const gatewayShared = __webpack_share_scopes__.default;

  // For each shared module in root, use it in gateway if not already loaded
  // @ts-ignore
  for (const [key, value] of Object.entries(rootShared)) {
    if (!gatewayShared[key] || !gatewayShared[key].loaded) {
      gatewayShared[key] = value;
    }
  }
}

const { saltboxModule: saltboxModuleImported } = await import("./bootstrap");

export const saltboxModule = saltboxModuleImported;
