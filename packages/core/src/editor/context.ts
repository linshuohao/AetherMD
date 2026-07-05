import type { CommandEventRuntime } from "../command-event-runtime.js";
import type {
  EngineAdapter,
  EngineSession,
  ParserAdapter,
  SerializerAdapter,
} from "../adapter-types.js";
import type { PermissionId } from "../types.js";

/** M4.5 stub — full History semantics deferred to a later milestone. */
export interface HistoryService {
  undo(): void;
  redo(): void;
}

/** M4.5 stub — full Selection semantics deferred. */
export interface SelectionService {
  getSelection(): null;
}

/** M4.5 stub — full Clipboard semantics deferred. */
export interface ClipboardService {
  copy(): void;
  paste(): void;
}

/** M4.5 stub — Asset interceptor deferred. */
export interface AssetInterceptorService {
  intercept(): void;
}

/** M4.5 stub — Telemetry deferred. */
export interface TelemetryService {
  track(): void;
}

export interface LoggerSink {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

const noopLogger: LoggerSink = {
  info() {},
  warn() {},
  error() {},
};

const noopHistory: HistoryService = {
  undo() {},
  redo() {},
};

const noopSelection: SelectionService = {
  getSelection() {
    return null;
  },
};

const noopClipboard: ClipboardService = {
  copy() {},
  paste() {},
};

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

export interface EditorContextOptions {
  runtime: CommandEventRuntime;
  engine: EngineAdapter;
  session: EngineSession;
  parser: ParserAdapter;
  serializer: SerializerAdapter;
  grantedPermissions?: Iterable<PermissionId>;
  logger?: LoggerSink;
}

export class EditorContext {
  public readonly commands: CommandEventRuntime;
  public readonly events: CommandEventRuntime;
  public readonly logger: LoggerSink;
  public readonly telemetry: TelemetryService = noopTelemetry;
  public readonly grantedPermissions: ReadonlySet<PermissionId>;
  public readonly services: {
    engine: EngineAdapterService;
    parser: ParserAdapterService;
    history: HistoryService;
    selection: SelectionService;
    clipboard: ClipboardService;
    assets: AssetInterceptorService;
  };

  constructor(options: EditorContextOptions) {
    this.commands = options.runtime;
    this.events = options.runtime;
    this.logger = options.logger ?? noopLogger;
    this.grantedPermissions = new Set(options.grantedPermissions ?? []);
    this.services = {
      engine: {
        adapter: options.engine,
        session: options.session,
      },
      parser: {
        adapter: options.parser,
        serializer: options.serializer,
      },
      history: noopHistory,
      selection: noopSelection,
      clipboard: noopClipboard,
      assets: noopAssets,
    };
  }
}

export function createEditorContext(options: EditorContextOptions): EditorContext {
  return new EditorContext(options);
}
