# 扩展生命周期

> 状态：设计草案 + M1 Core Bootstrap。本页作为生命周期主题的维护入口。

## 扩展生命周期

```mermaid
flowchart TB
  shell["Shell 传入 Plugin 数组"]
  load["loadManifest<br/>收集并规范化 Manifest"]
  deps["resolveDeps<br/>metadata.requires + metadata.dependsOn 拓扑排序"]
  merge["merge<br/>合并 compile.* 层"]
  validate["validate<br/>manifestVersion / Service Capability / ConflictResolver"]
  adapter["createAdapter"]
  init["onInit<br/>runtime.onInit，按依赖序"]
  ready["onReady<br/>runtime.onReady"]
  running["running"]
  dispose["dispose"]
  destroy["onDestroy<br/>runtime.onDestroy，逆序"]

  shell --> load --> deps --> merge --> validate --> adapter --> init --> ready --> running --> dispose --> destroy
```

**阶段约束：**

| 阶段 | 允许 | 应避免 |
| --- | --- | --- |
| `loadManifest` ~ `validate` | 纯数据操作 | 副作用、DOM |
| `onInit` | DOM 绑定、事件订阅 | 注册 Command |
| `onReady` | 读取初始状态 | 修改已合并 Schema |
| `running` | Command Bus | 直接调用 Adapter 内部 API |
| `onDestroy` | 资源清理 | 派发新 Command |

## M1 Core Bootstrap subset

`@aether-md/core` 当前只实现 lifecycle bootstrap 子集：

- Manifest shape/version validation。
- Service Capability validation。
- `metadata.dependsOn` deterministic order。
- `runtime.onInit` 与 `runtime.onReady` dependency order。
- `dispose()` 逆序调用 `runtime.onDestroy`，重复 dispose 不重复执行 destroy hooks。

M1 不执行 compile layer merge、ConflictResolver、Adapter creation、Command Bus、Event Hub 或 document running state。

---
