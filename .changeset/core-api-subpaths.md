---
"@aether-md/core": major
---

Narrow `@aether-md/core` default export to the host API and add role-based subpaths (`/plugin`, `/adapter`, `/document`, `/testing`). Move `bootstrapCore` and `createCommandEventRuntime` to `/testing`; remove internal service factories from the public surface.
