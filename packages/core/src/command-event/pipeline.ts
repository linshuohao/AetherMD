import type { CapabilityId, PermissionId } from "../types.js";
import { CoreError } from "../errors.js";
import type { CommandId, CommandRequest, CommandResult } from "./types.js";

export const MUTATING_COMMAND_IDS = new Set<CommandId>(["core:replaceText", "core:moveBlock"]);

export interface CommandRegistrationMeta {
  requires?: readonly CapabilityId[];
  permissions?: readonly PermissionId[];
  mutating?: boolean;
}

export interface CommandPipelineContext {
  readOnly: boolean;
  providedCapabilities: ReadonlySet<CapabilityId>;
  grantedPermissions: ReadonlySet<PermissionId>;
}

export function isMutatingCommand(
  command: CommandRequest,
  registration?: CommandRegistrationMeta,
): boolean {
  if (registration?.mutating !== undefined) {
    return registration.mutating;
  }
  return MUTATING_COMMAND_IDS.has(command.id);
}

export function runReadOnlyGuard(
  context: CommandPipelineContext,
  command: CommandRequest,
  registration?: CommandRegistrationMeta,
): CommandResult | null {
  if (!context.readOnly) {
    return null;
  }
  if (!isMutatingCommand(command, registration)) {
    return null;
  }
  return {
    ok: false,
    error: new CoreError({
      code: "COMMAND_UNKNOWN",
      message: "Editor is read-only",
      severity: "recoverable",
    }),
  };
}

export function runCapabilityGuard(
  context: CommandPipelineContext,
  registration?: CommandRegistrationMeta,
): CommandResult | null {
  const required = registration?.requires;
  if (!required || required.length === 0) {
    return null;
  }
  for (const capability of required) {
    if (!context.providedCapabilities.has(capability)) {
      return {
        ok: false,
        error: new CoreError({
          code: "COMMAND_UNKNOWN",
          message: `Missing required capability: ${capability}`,
          severity: "recoverable",
        }),
      };
    }
  }
  return null;
}

export function runPermissionGuard(
  context: CommandPipelineContext,
  registration?: CommandRegistrationMeta,
): CommandResult | null {
  const required = registration?.permissions;
  if (!required || required.length === 0) {
    return null;
  }
  for (const permission of required) {
    if (!context.grantedPermissions.has(permission)) {
      return {
        ok: false,
        error: new CoreError({
          code: "PERMISSION_DENIED",
          message: `Missing required permission: ${permission}`,
          severity: "recoverable",
        }),
      };
    }
  }
  return null;
}

export function runCommandPipelineGuards(
  context: CommandPipelineContext,
  command: CommandRequest,
  registration?: CommandRegistrationMeta,
): CommandResult | null {
  return (
    runReadOnlyGuard(context, command, registration) ??
    runCapabilityGuard(context, registration) ??
    runPermissionGuard(context, registration)
  );
}
