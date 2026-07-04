# Core Bootstrap Delta Spec

## ADDED Requirements

### Requirement: Minimal Core package exists

实现 SHALL 引入 M1 Core Bootstrap 所需的最小 `@aether-md/core` 包结构。

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/package-layout.md`
- `docs/architecture/core-api.md`

#### Scenario: Core package exposes M1 bootstrap surface

- **GIVEN** consumer 从 `@aether-md/core` 导入内容
- **WHEN** M1 package 完成构建
- **THEN** package 暴露本 spec 所需的 Manifest、plugin、capability、supported Manifest version 和 bootstrap error 类型
- **AND** M1 不暴露 Command Bus、Event Hub、Adapter、React Shell、Remark、ProseMirror 或 GFM preset API

### Requirement: Manifest version is validated during bootstrap

Core SHALL 使用 `SUPPORTED_MANIFEST_VERSIONS` 校验每个插件 Manifest 的 `metadata.manifestVersion`。

References:

- `docs/sdk/manifest.md`
- `docs/architecture/compatibility.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/error-model.md`

#### Scenario: Supported manifest version starts successfully

- **GIVEN** 插件 Manifest 的 `metadata.manifestVersion` 为 `1`
- **WHEN** Core bootstrap 该插件
- **THEN** Manifest version validation 成功

#### Scenario: Unsupported manifest version aborts startup

- **GIVEN** 插件 Manifest 的 `metadata.manifestVersion` 不在 `SUPPORTED_MANIFEST_VERSIONS` 中
- **WHEN** Core bootstrap 该插件
- **THEN** startup 以 fatal Core bootstrap error 失败
- **AND** 该 plugin set 的 lifecycle hooks 不会运行

### Requirement: Manifest shape is validated before lifecycle hooks

Core SHALL 在运行 runtime lifecycle hooks 前，拒绝没有提供有效分层 `ExtensionManifest` 的 plugin entries。

References:

- `docs/sdk/manifest.md`
- `docs/engineering/manifest-loading.md`
- `docs/sdk/lifecycle.md`

#### Scenario: Invalid Manifest shape aborts startup

- **GIVEN** plugin entry 没有有效的 `manifest.metadata` object
- **WHEN** Core 加载 plugin manifests
- **THEN** startup 以 fatal Core bootstrap error 失败
- **AND** 不调用任何 `runtime.onInit` 或 `runtime.onReady` hook

### Requirement: Service Capability requirements are validated

Core SHALL 使用 Core 和 plugin `metadata.provides` 提供的 capabilities，校验每个 `metadata.requires` 声明的 Service Capability。

References:

- `docs/sdk/capabilities-and-permissions.md`
- `docs/glossary.md`
- `docs/adr/005-manifest-capabilities-versioning.md`
- `docs/adr/006-layered-manifest-permission-model.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Required capability is provided

- **GIVEN** 某 plugin requires 一个 Service Capability
- **AND** 该 capability 由 Core 或另一个已加载 plugin 提供
- **WHEN** Core 校验 Service Capabilities
- **THEN** bootstrap 继续执行

#### Scenario: Required capability is missing

- **GIVEN** 某 plugin requires 一个没有任何 loaded provider 提供的 Service Capability
- **WHEN** Core 校验 Service Capabilities
- **THEN** startup 以 fatal Core bootstrap error 失败
- **AND** 该 plugin set 的 lifecycle hooks 不会运行

### Requirement: Plugin dependsOn order is resolved deterministically

Core SHALL 在 lifecycle startup 前，将 `metadata.dependsOn` 解析为确定性的拓扑顺序。

References:

- `docs/sdk/manifest.md`
- `docs/sdk/lifecycle.md`
- `docs/engineering/test-strategy.md`
- `docs/adr/005-manifest-capabilities-versioning.md`

#### Scenario: Dependent plugin starts after dependency

- **GIVEN** plugin `table` 声明 `metadata.dependsOn: ["heading"]`
- **AND** plugin `heading` 已加载
- **WHEN** Core 解析 lifecycle order
- **THEN** `heading` 排在 `table` 之前

#### Scenario: Missing plugin dependency aborts startup

- **GIVEN** 某 plugin 声明依赖一个未加载的 plugin name
- **WHEN** Core 解析 lifecycle order
- **THEN** startup 以 fatal Core bootstrap error 失败
- **AND** 该 plugin set 的 lifecycle hooks 不会运行

#### Scenario: Dependency cycle aborts startup

- **GIVEN** 已加载 plugins 的 `metadata.dependsOn` 存在依赖环
- **WHEN** Core 解析 lifecycle order
- **THEN** startup 以 fatal Core bootstrap error 失败
- **AND** 该 plugin set 的 lifecycle hooks 不会运行

### Requirement: Lifecycle hooks run in dependency order

Manifest 和 dependency validation 成功后，Core SHALL 按解析后的 dependency order 运行 `runtime.onInit` 和 `runtime.onReady`。

References:

- `docs/sdk/lifecycle.md`
- `docs/architecture/core-api.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Startup invokes lifecycle hooks in order

- **GIVEN** plugins 拥有有效 Manifests 和已解析依赖
- **WHEN** Core starts
- **THEN** `runtime.onInit` 按 dependency order 调用
- **AND** successful `onInit` 后，`runtime.onReady` 按 dependency order 调用

### Requirement: Dispose destroys plugins in reverse lifecycle order

Core SHALL 暴露 dispose path，并按 successful lifecycle order 的逆序调用 `runtime.onDestroy`。

References:

- `docs/sdk/lifecycle.md`
- `docs/architecture/core-api.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Dispose invokes onDestroy in reverse order

- **GIVEN** plugins 已按 dependency order 成功启动
- **WHEN** editor 被 disposed
- **THEN** `runtime.onDestroy` 按 successful lifecycle order 的逆序调用

### Requirement: M1 excludes later milestone behavior

Core Bootstrap implementation SHALL NOT 在本 change 中实现后续里程碑行为。

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/core-api.md`
- `docs/sdk/lifecycle.md`

#### Scenario: Later milestone APIs are not required for M1 tests

- **GIVEN** M1 Core Bootstrap tests 运行
- **WHEN** tests 校验 Manifest loading、dependency validation、lifecycle startup 和 dispose
- **THEN** tests 不需要 Command Bus、Event Hub、Adapter creation、Markdown parsing、Markdown serialization、React Shell、Remark、ProseMirror 或 GFM preset packages

### Requirement: Workflow documents are written in Chinese

本 change 的 OpenSpec 与后续 Superpowers workflow 文档 SHALL 使用中文撰写说明性内容，同时保留代码标识、API 名称、包名、文件路径和工具要求的结构关键词为英文。

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/maintenance.md`

#### Scenario: OpenSpec artifacts use Chinese prose

- **GIVEN** reviewer 打开本 change 的 proposal、design、delta spec 或 tasks
- **WHEN** reviewer 阅读说明性内容
- **THEN** 正文使用中文表达
- **AND** `@aether-md/core`、`ExtensionManifest`、`metadata.requires`、文件路径和 OpenSpec 结构关键词保持英文

#### Scenario: Follow-up workflow artifacts use Chinese prose

- **GIVEN** 后续 workflow 生成 plan、task、validation、review 或 archive 文档
- **WHEN** artifact 包含说明性内容
- **THEN** 说明性内容使用中文
- **AND** 代码标识、API 名称、包名、文件路径和工具要求的结构关键词保持英文
