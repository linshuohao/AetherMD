import { defineConfig } from "vitepress";
import { withMermaid } from '@aether-labs/vitepress-mermaid'

export default defineConfig(withMermaid({
  title: "AetherMD",
  description: "交互驱动、框架无关、高度插件化的现代富文本 Markdown 引擎架构与插件 SDK 文档",
  lang: "zh-CN",
  lastUpdated: true,
  cleanUrls: true,
  // Subdirectory README.md files are GitHub index pages; map them to VitePress index routes.
  rewrites: {
    ":dir/README.md": ":dir/index.md",
  },
  ignoreDeadLinks: [/\.\.\//, /AI_NATIVE_ENGINEERING_WORKFLOW/, /\/essays\//, /LICENSE$/],
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "文档", link: "/README" },
      { text: "架构", link: "/architecture/principles" },
      { text: "SDK", link: "/sdk/overview" },
      { text: "工程", link: "/engineering/mvp-implementation-plan" },
      { text: "ADR", link: "/adr/" },
      { text: "社区", link: "/community/governance" },
    ],
    sidebar: {
      "/": [
        {
          text: "入门",
          items: [
            { text: "文档入口", link: "/README" },
            { text: "能力概览", link: "/project-status" },
            { text: "核心词汇表", link: "/glossary" },
            { text: "文档维护规则", link: "/maintenance" },
            { text: "Examples Matrix", link: "/examples/matrix" },
          ],
        },
        {
          text: "架构",
          collapsed: false,
          items: [
            { text: "架构文档", link: "/architecture/" },
            { text: "设计文档映射", link: "/architecture/design-doc-map" },
            { text: "文档约定", link: "/architecture/conventions" },
            { text: "架构原则与边界", link: "/architecture/principles" },
            {
              text: "架构优化原则",
              link: "/architecture/architecture-optimization-principles",
            },
            {
              text: "产品交互体验规范",
              link: "/architecture/product-experience-spec",
            },
            { text: "架构总览", link: "/architecture/overview" },
            { text: "Core API", link: "/architecture/core-api" },
            { text: "文档模型", link: "/architecture/document-model" },
            { text: "兼容策略", link: "/architecture/compatibility" },
            { text: "目录结构", link: "/architecture/package-layout" },
            { text: "v1.0 能力范围", link: "/architecture/roadmap" },
            { text: "CI 校验计划", link: "/architecture/ci-checklist" },
          ],
        },
        {
          text: "Plugin SDK",
          collapsed: false,
          items: [
            { text: "SDK 文档", link: "/sdk/" },
            { text: "SDK 概述", link: "/sdk/overview" },
            { text: "Manifest", link: "/sdk/manifest" },
            {
              text: "能力与权限",
              link: "/sdk/capabilities-and-permissions",
            },
            { text: "生命周期", link: "/sdk/lifecycle" },
            { text: "命令", link: "/sdk/commands" },
            {
              text: "Command/Event 协议",
              link: "/sdk/command-event-protocol",
            },
            { text: "EditorContext", link: "/sdk/editor-context" },
            { text: "冲突解决", link: "/sdk/conflict-resolution" },
            {
              text: "CustomBlockRenderer",
              link: "/sdk/custom-block-renderer",
            },
            { text: "React Shell", link: "/sdk/react-shell" },
            { text: "Vue Shell", link: "/sdk/vue-shell" },
            { text: "插件示例", link: "/sdk/examples" },
          ],
        },
        {
          text: "工程",
          collapsed: false,
          items: [
            { text: "工程文档", link: "/engineering/" },
            {
              text: "实施范围与验收标准",
              link: "/engineering/mvp-implementation-plan",
            },
            {
              text: "示例与集成验证",
              link: "/engineering/demo-slice-delivery-program",
            },
            { text: "数据流", link: "/engineering/data-flow" },
            { text: "Adapter 协议", link: "/engineering/adapter-protocol" },
            { text: "错误模型", link: "/engineering/error-model" },
            { text: "线程模型", link: "/engineering/thread-model" },
            { text: "可观测性", link: "/engineering/observability" },
            { text: "并发策略", link: "/engineering/concurrency" },
            { text: "安全模型", link: "/engineering/security" },
            { text: "性能原则", link: "/engineering/performance" },
            {
              text: "Manifest 加载",
              link: "/engineering/manifest-loading",
            },
            {
              text: "ConflictResolver",
              link: "/engineering/conflict-resolver",
            },
            { text: "测试策略", link: "/engineering/test-strategy" },
            {
              text: "组件库治理规范",
              link: "/engineering/component-library-governance",
            },
          ],
        },
        {
          text: "ADR",
          collapsed: true,
          items: [
            { text: "ADR 索引", link: "/adr/" },
            {
              text: "001 微内核架构",
              link: "/adr/001-microkernel-architecture",
            },
            {
              text: "002 声明式 Manifest 合并",
              link: "/adr/002-declarative-manifest-merging",
            },
            {
              text: "003 Remark/ProseMirror 双轨",
              link: "/adr/003-remark-prosemirror-dual-track",
            },
            {
              text: "004 Command Queue 错误模型",
              link: "/adr/004-command-queue-error-model",
            },
            {
              text: "005 Manifest 能力版本",
              link: "/adr/005-manifest-capabilities-versioning",
            },
            {
              text: "006 分层 Manifest 权限",
              link: "/adr/006-layered-manifest-permission-model",
            },
            {
              text: "007 文档体系三分法",
              link: "/adr/007-document-suite-split",
            },
            {
              text: "008 仓库工具底座",
              link: "/adr/008-repo-toolchain-baseline",
            },
            {
              text: "009 发布与治理",
              link: "/adr/009-release-governance",
            },
            {
              text: "010 块稳定身份",
              link: "/adr/010-block-stable-identity",
            },
          ],
        },
        {
          text: "社区",
          collapsed: true,
          items: [
            { text: "社区文档", link: "/community/" },
            { text: "治理", link: "/community/governance" },
            { text: "审查指南", link: "/community/review-guide" },
            { text: "Git 工作流", link: "/community/git-workflow" },
            { text: "发布流程", link: "/community/release-process" },
          ],
        },
      ],
    },
    socialLinks: [{ icon: "github", link: "https://github.com/linshuohao/AetherMD" }],
    search: {
      provider: "local",
    },
    footer: {
      message: "MIT Licensed",
      copyright: "Copyright © 2026 AetherMD Contributors",
    },
    outline: {
      label: "本页目录",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "medium",
        timeStyle: "short",
      },
    },
  },
}));
