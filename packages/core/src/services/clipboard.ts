import { CoreError } from "../errors.js";
import type { PermissionId } from "../types.js";

export interface ClipboardService {
  copy(text: string): void;
  read(): string;
  paste(): string;
  clear(): void;
}

export interface ClipboardServiceOptions {
  grantedPermissions: ReadonlySet<PermissionId>;
}

const CLIPBOARD_PERMISSION: PermissionId = "perm:clipboard";

function assertClipboardPermission(grantedPermissions: ReadonlySet<PermissionId>): void {
  if (!grantedPermissions.has(CLIPBOARD_PERMISSION)) {
    throw new CoreError({
      code: "PERMISSION_DENIED",
      message: `Missing required permission: ${CLIPBOARD_PERMISSION}`,
      severity: "recoverable",
    });
  }
}

export function createClipboardService(options: ClipboardServiceOptions): ClipboardService {
  const { grantedPermissions } = options;
  let buffer = "";

  return {
    copy(text: string) {
      assertClipboardPermission(grantedPermissions);
      buffer = text;
    },
    read() {
      assertClipboardPermission(grantedPermissions);
      return buffer;
    },
    paste() {
      assertClipboardPermission(grantedPermissions);
      return buffer;
    },
    clear() {
      assertClipboardPermission(grantedPermissions);
      buffer = "";
    },
  };
}
