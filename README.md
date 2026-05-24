# 单词大闯关

一款面向中国小学1-6年级学生的英语词汇学习移动应用，采用游戏化设计，让学生在轻量化的日常学习中高效积累词汇。

## 功能特色

- **每日学习** - 每天10个新单词，包含音标、例句，AI发音朗读
- **每日打卡** - 学完即可打卡，连续打卡获得额外奖励
- **单词测验** - 15秒/题计时练习，即时反馈强化记忆
- **PK对战** - 与AI对手实时对战，5种难度/性格角色
- **错题复习** - 自动收集错题，针对性强化训练
- **XP等级系统** - 10级成长体系，学习解锁成就称号
- **日历统计** - 可视化学习记录，坚持养成习惯

## 快速开始

### 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 安装运行

```bash
# 安装依赖
npm install

# H5 开发（热更新）
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# 生产构建 H5
npm run build:h5
```

### Android APK 构建

```bash
# 构建 H5
npm run build:h5

# 同步到 Android
npx cap sync android

# 编译 APK
cd android && ./gradlew assembleDebug
```

APK 输出路径: `android/app/build/outputs/apk/debug/app-debug.apk`

## 项目结构

```
src/
├── pages/
│   ├── splash/      # 启动页
│   ├── grade/        # 年级选择
│   ├── home/         # 首页
│   ├── learn/        # 单词学习
│   ├── quiz/         # 单词测验
│   ├── battle-match/ # PK匹配
│   ├── battle/       # PK对战
│   ├── battle-result/ # 对战结果
│   ├── result/        # 测验结果
│   ├── review/        # 错题复习
│   ├── calendar/      # 打卡日历
│   └── my/            # 个人中心
├── components/
│   ├── LIcon.vue      # 内置图标库（100+ Lucide风格SVG）
│   ├── TabBar.vue     # 自定义底部导航
│   ├── WordToast.vue  # 答题反馈动画
│   ├── Fireworks.vue  # 胜利烟花特效
│   ├── BattleTimer.vue   #对战计时器
│   ├── ComboIndicator.vue # 连击提示
│   └── ...
├── utils/
│   ├── words.js       # 单词数据库（按年级/版本分）
│   ├── storage.js     # 本地存储管理
│   ├── helpers.js     # 工具函数（洗牌/日期/XP计算）
│   ├── edition.js     # 教材版本管理
│   └── sound.js       # 音效系统（Web Audio API）
└── assets/
    └── audio/encouragements/  # 鼓励语音mp3
```

## 数据存储

所有数据存储在本地 `wordQuizStats`，按**年级+教材版本**隔离:

| Key格式 | 说明 |
|---------|------|
| `g{grade}_{edition}` | 学习统计数据 {learned, mastered, wins} |
| `wrong_g{grade}_{edition}` | 错题单词列表 |
| `{yyyy-mm-dd}_g{grade}_{edition}` | 每日已学单词 |
| `checkin_g{grade}_{edition}` | 打卡数据 {streak, maxStreak} |
| `totalXP` | 全局经验值（不随年级变化） |
| `battle_stats` | PK段位/胜率数据 |

## 技术栈

- **框架**: UniApp (Vue 3 Composition API)
- **构建**: Vite + @dcloudio/vite-plugin-uni
- **移动端**: Capacitor 8（Android打包）
- **状态**: 组件局部状态 + uni.getStorageSync 持久化
- **图标**: 内置LIcon组件（100+ Lucide风格SVG，无外部依赖）
- **音效**: Web Audio API（Tone生成）+ MP3鼓励语音

## 版本要求

| 依赖 | 版本 |
|------|------|
| Node.js | ≥ 18（建议22） |
| Java | ≥ 21（Android编译） |
| Android SDK | 最新稳定版 |

## License

MIT