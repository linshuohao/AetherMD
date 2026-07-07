import type { ParserAdapter, SerializerAdapter } from "../document/adapter-types.js";
import type { AetherDoc, AetherSchema } from "../document/model.js";
import type { WorkerHost } from "./worker-host.js";

export function createWorkerParserAdapter(host: WorkerHost, baseName: string): ParserAdapter {
  return {
    name: `${baseName}:worker`,
    async parse(markdown: string, schema: AetherSchema): Promise<AetherDoc> {
      const result = await host.requestParse({ markdown, schema });
      return result.doc;
    },
  };
}

export function createWorkerSerializerAdapter(
  host: WorkerHost,
  baseName: string,
): SerializerAdapter {
  return {
    name: `${baseName}:worker`,
    async serialize(doc: AetherDoc, schema: AetherSchema): Promise<string> {
      const result = await host.requestSerialize({ doc, schema });
      return result.markdown;
    },
  };
}
