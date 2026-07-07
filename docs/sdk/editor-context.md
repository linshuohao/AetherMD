# EditorContext 边界


## EditorContext 边界

```typescript
export class EditorContext {
  public readonly commands: CommandBusService;
  public readonly events: EventHubService;
  public readonly logger: CentralLoggerService;
  public readonly telemetry: TelemetryService;

  public readonly services: {
    engine: EngineAdapterService;
    parser: ParserAdapterService;
    history: HistoryService;
    selection: SelectionService;
    clipboard: ClipboardService;
    assets: AssetInterceptorService;
  };

  /** 当前插件已授予的运行时权限（只读） */
  public readonly grantedPermissions: ReadonlySet<PermissionId>;
}
```

插件 **SHOULD NOT** 向 Context 注册自定义业务服务（HTTP、存储、AI）。

---
