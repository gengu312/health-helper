# Health Helper - 项目规则与指南

## 1. 技术栈与环境
- **框架**: React Native (0.73+)
- **语言**: TypeScript (严格模式)
- **UI 库**: React Native Paper (Material Design 3)
- **导航**: React Navigation (Native Stack)
- **状态管理**: Zustand
- **数据库**: WatermelonDB (离线优先, 基于 SQLite)
- **图表**: Victory Native XL (通过 React Native Skia)
- **OCR**: react-native-mlkit-ocr
- **日期处理**: date-fns

## 2. 代码规范
- **函数式组件**: 所有 UI 元素使用带 Hooks 的函数式组件。
- **TypeScript**:
  - 禁止使用 `any` 类型。为所有 props 和 state 定义接口。
  - 对象定义使用 `type`，类实现使用 `interface`（如果有）。
- **异步/等待**: 优先使用 `async/await` 而不是 `.then()`。
- **文件结构**:
  - `docs/`: 项目文档 (PRD, 架构文档等)。
  - `src/features/`: 基于功能的模块 (例如 `blood-pressure`, `reminders`)。
  - `src/components/`: 共享 UI 组件。
  - `src/services/`: 单例服务 (数据库, API, OCR)。
  - `src/utils/`: 纯工具函数。
  - `src/theme/`: 主题定义 (颜色, 排版)。

## 3. UI/UX 指南 (Material Design 3)
- **主题化**: 使用 `react-native-paper` 的 `useTheme()` 获取颜色。不要硬编码十六进制值。
- **深色模式**: 确保所有组件同时支持浅色和深色模式。
- **间距**: 使用 4pt 网格系统 (4, 8, 12, 16, 24, 32...).
- **排版**: 使用 Material Design 3 字体阶梯 (Display, Headline, Title, Body, Label)。
- **无障碍性**:
  - 所有交互元素必须有 `accessible={true}` 和 `accessibilityLabel`。
  - 最小触摸目标尺寸: 48x48dp。

## 4. 性能规则
- **记忆化**: 对昂贵的计算和传递给子组件的回调使用 `useMemo` 和 `useCallback`。
- **列表**: 长列表使用 `FlashList` (Shopify) 代替 `FlatList`。
- **图片**: 使用优化的图片格式和缓存 (例如 `expo-image` 或 `react-native-fast-image`)。
- **数据库**: 使用 WatermelonDB 的 `write()` 块批量处理数据库操作。

## 5. 隐私与安全
- **数据存储**: 所有敏感健康数据必须存储在本地 WatermelonDB 中。
- **加密**: 如果可能，使用 SQLCipher (或类似适配器) 进行 WatermelonDB 加密，或在存储前加密敏感字段。
- **禁止上传**: 未经用户明确同意和加密，不得实现任何将健康数据上传到外部服务器的 API 调用。

## 6. 鸿蒙兼容性 (HarmonyOS)
- **RNOH**: 保持代码为标准 React Native。除非必要，避免使用不支持鸿蒙 (RNOH) 的原生模块。
- **测试**: 在 Android 和 iOS 心理模型上验证逻辑。

## 7. 开发工作流
- **文档**: 所有技术文档和需求文档存放于 `docs/` 目录。
- **Linting**: 遵循 ESLint 和 Prettier 配置。
- **提交**: 使用语义化提交消息 (feat, fix, docs, style, refactor)。
