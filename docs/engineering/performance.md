# 工程防御性原则

## 工程防御性原则

1. **单向数据闸门 (No Double Binding)** **MUST**
   外壳 **MUST** 在 `emit("change")` 时用 `prevValue === nextValue` 拦截回灌，**MUST NOT** 重设文档。

2. **避免响应式劫持 (No Reactive Proxy)** **MUST NOT**
   内核实例 **MUST NOT** 装入 `useState` / `reactive`；**MUST** 使用 `useRef` / `shallowRef`。

3. **节点特区独立性 (Vanilla NodeView)** **RECOMMENDED**
   NodeView **SHOULD** 使用纯原生 DOM，**SHOULD NOT** 在内部使用 React/Vue 渲染器。

4. **增量序列化 (Dirty Check)** **RECOMMENDED**
   全量导出 **SHOULD** 避免；仅序列化脏节点子树。

5. **Manifest 静态合并缓存** **RECOMMENDED**
   `compile` 层合并结果 **SHOULD** 在 `validate` 后冻结（`Object.freeze`），防止运行时突变。

---
