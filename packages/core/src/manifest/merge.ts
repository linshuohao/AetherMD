import { CoreError } from "../errors.js";
import type { AetherSchema } from "../document/model.js";
import type { ConflictResolver } from "../editor/conflict-resolver.js";
import { createDefaultConflictResolver } from "../editor/conflict-resolver.js";
import type { LoadedPlugin } from "./manifest.js";
import type { PermissionId } from "../types.js";
import {
  areSchemaDeclarationsEqual,
  normalizeSchemaDeclarations,
  schemaDeclarationKey,
  type SchemaDeclaration,
} from "./schema.js";

export interface MergedCompileLayer {
  schema: AetherSchema;
  declarations: readonly SchemaDeclaration[];
}

export interface MergedManifestLayers {
  compile: MergedCompileLayer;
  securityRequests: ReadonlySet<PermissionId>;
}

export function mergeCompileSchemas(
  loadedPlugins: readonly LoadedPlugin[],
  conflictResolver: ConflictResolver = createDefaultConflictResolver(),
): MergedCompileLayer {
  const byKey = new Map<string, SchemaDeclaration>();

  for (const loadedPlugin of loadedPlugins) {
    const declarations = normalizeSchemaDeclarations(
      loadedPlugin.manifest.compile?.schema as SchemaDeclaration | SchemaDeclaration[] | undefined,
    );

    for (const incoming of declarations) {
      const key = schemaDeclarationKey(incoming);
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, incoming);
        continue;
      }

      if (areSchemaDeclarationsEqual(existing, incoming)) {
        continue;
      }

      const resolution = conflictResolver.resolve({
        type: "schema",
        existing: { value: existing },
        incoming: { value: incoming },
      });

      if (resolution.strategy === "abort") {
        throw new CoreError({
          code: "MANIFEST_INVALID",
          message: `Schema conflict for ${key} between plugins`,
          pluginName: loadedPlugin.manifest.metadata.name,
        });
      }

      byKey.set(key, resolution.winner as SchemaDeclaration);
    }
  }

  const declarations = [...byKey.values()];
  return {
    schema: { version: 1 },
    declarations,
  };
}

export function mergeSecurityLayers(
  loadedPlugins: readonly LoadedPlugin[],
): ReadonlySet<PermissionId> {
  const requests = new Set<PermissionId>();
  for (const loadedPlugin of loadedPlugins) {
    for (const permission of loadedPlugin.manifest.security?.requests ?? []) {
      requests.add(permission);
    }
  }
  return requests;
}

export function mergeManifestLayers(
  loadedPlugins: readonly LoadedPlugin[],
  conflictResolver?: ConflictResolver,
): MergedManifestLayers {
  return {
    compile: mergeCompileSchemas(loadedPlugins, conflictResolver),
    securityRequests: mergeSecurityLayers(loadedPlugins),
  };
}
