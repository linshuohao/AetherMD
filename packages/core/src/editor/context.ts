import type { CommandEventRuntime } from "../command-event/runtime.js";
import type {
  EngineAdapter,
  EngineSession,
  ParserAdapter,
  SerializerAdapter,
} from "../document/adapter-types.js";
import type { PermissionId } from "../types.js";
import type { ClipboardService } from "../services/clipboard.js";
import type { DocumentHistory, HistoryService } from "../services/history.js";
import type { SelectionService } from "../services/selection.js";

/** Asset interceptor deferred to later wave. */
export interface AssetInterceptorService {
  intercept(): void;
}

/** Telemetry deferred to Wave 8. */
export interface TelemetryService {
  track(): void;
}

export interface LoggerSink {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

const noopAssets: AssetInterceptorService = {
  intercept() {},
};

const noopTelemetry: TelemetryService = {
  track() {},
};

export interface EngineAdapterService {
  readonly adapter: EngineAdapter;
  readonly session: EngineSession;
}

export interface ParserAdapterService {
  readonly adapter: ParserAdapter;
  readonly serializer: SerializerAdapter;
}

export interface BuiltinServices {
  history: HistoryService;
  selection: SelectionService;
  clipboard: ClipboardService;
  documentHistory: DocumentHistory;
}

export interface EditorContextOptions {
  runtime: CommandEventRuntime;
  engine: EngineAdapter;
  session: EngineSession;
  parser: ParserAdapter;
  serializer: SerializerAdapter;
  grantedPermissions?: Iterable<PermissionId>;
  logger?: LoggerSink;
  builtin?: BuiltinServices;
}

export class EditorContext {
  public readonly commands: CommandEventRuntime;
  public readonly events: CommandEventRuntime;
  public readonly logger: LoggerSink;
  public readonly telemetry: TelemetryService = noopTelemetry;
  public readonly grantedPermissions: ReadonlySet<PermissionId>;
  public readonly documentHistory: DocumentHistory;
  public readonly services: {
    engine: EngineAdapterService;
    parser: ParserAdapterService;
    history: HistoryService;
    selection: SelectionService;
    clipboard: ClipboardService;
    assets: AssetInterceptorService;
  };

  constructor(options: EditorContextOptions) {
    if (!options.builtin) {
      throw new Error("EditorContext requires builtin services");
    }

    this.commands = options.runtime;
    this.events = options.runtime;
    this.logger = options.logger ?? {
      info() {},
      warn() {},
      error() {},
    };
    this.grantedPermissions = new Set(options.grantedPermissions ?? []);
    this.documentHistory = options.builtin.documentHistory;
    this.services = {
      engine: {
        adapter: options.engine,
        session: options.session,
      },
      parser: {
        adapter: options.parser,
        serializer: options.serializer,
      },
      history: options.builtin.history,
      selection: options.builtin.selection,
      clipboard: options.builtin.clipboard,
      assets: noopAssets,
    };
  }
}

export function createEditorContext(options: EditorContextOptions): EditorContext {
  return new EditorContext(options);
}

export type { ClipboardService, HistoryService, SelectionService };
