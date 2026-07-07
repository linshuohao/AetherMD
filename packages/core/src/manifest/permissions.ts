import type { LoadedPlugin } from "./manifest.js";
import type { PermissionId } from "../types.js";

/** Default host grants for official-only editors when security.grantedPermissions is omitted. */
export const DEFAULT_HOST_GRANTED_PERMISSIONS: readonly PermissionId[] = [
  "perm:dom",
  "perm:clipboard",
  "perm:async",
  "perm:timer",
];

export const DEFAULT_DENIED_PERMISSIONS: readonly PermissionId[] = ["perm:global"];

export function collectPluginPermissionRequests(
  loadedPlugins: readonly LoadedPlugin[],
): ReadonlySet<PermissionId> {
  const requested = new Set<PermissionId>();
  for (const loadedPlugin of loadedPlugins) {
    for (const permission of loadedPlugin.manifest.security?.requests ?? []) {
      requested.add(permission);
    }
  }
  return requested;
}

export interface ResolveEffectivePermissionsOptions {
  loadedPlugins: readonly LoadedPlugin[];
  hostGranted?: readonly PermissionId[];
  defaultDeny?: readonly PermissionId[];
}

/**
 * Effective runtime permissions = plugin requests ∩ host grants, with host defaults
 * when no plugin declares security.requests (official preset path).
 */
export function resolveEffectivePermissions(
  options: ResolveEffectivePermissionsOptions,
): ReadonlySet<PermissionId> {
  const requested = collectPluginPermissionRequests(options.loadedPlugins);
  const host = new Set(options.hostGranted ?? DEFAULT_HOST_GRANTED_PERMISSIONS);
  const deny = new Set(options.defaultDeny ?? DEFAULT_DENIED_PERMISSIONS);
  const candidates = requested.size > 0 ? requested : host;
  const effective = new Set<PermissionId>();

  for (const permission of candidates) {
    if (host.has(permission) && !deny.has(permission)) {
      effective.add(permission);
    }
  }

  return effective;
}
