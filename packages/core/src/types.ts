export type PluginName = string;

export type CoreCapabilityId =
  | "core:history"
  | "core:selection"
  | "core:clipboard"
  | "core:engine"
  | "core:parser"
  | "core:assets";

export type PluginCapabilityId = `plugin:${string}`;
export type VendorCapabilityId = `${string}:${string}`;

export type CapabilityId =
  | CoreCapabilityId
  | PluginCapabilityId
  | VendorCapabilityId;

export type PermissionId =
  | "perm:dom"
  | "perm:clipboard"
  | "perm:network"
  | "perm:storage"
  | "perm:worker"
  | "perm:timer"
  | "perm:async"
  | "perm:global";
