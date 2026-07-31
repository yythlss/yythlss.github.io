# Hi, I'm yythlss 👋

武汉理工大学电子信息工程本科生，主要关注嵌入式系统、智能硬件、数字与模拟电路，以及 AI 应用开发。

我喜欢把课程设计和实验原型继续完善成结构清晰、资料完整、可以复现的开源项目：从电路设计、传感器接入和实时任务，到 Web 应用、知识库与 Agent 工作流。

## About Me

- 🎯 方向：嵌入式软件、智能硬件与硬件系统开发
- 🔧 实践：STM32、ESP32-S3、FreeRTOS、传感器、舵机、语音模块和串口屏
- ⚡ 电路：模拟电子技术、数字电子技术、Multisim 仿真与嘉立创 EDA
- 🤖 AI：OpenAI-compatible API、知识库问答、产品原型 Agent 与 MCP 工具链
- 📚 习惯：重视 README、接线说明、调试记录、测试验证和可复现交付

## Featured Embedded & Hardware Projects

### [Smart Home Controller](https://github.com/yythlss/Smart-Home-Controller)

基于 ESP32-S3 和小智 AI 固件扩展的智能家居控制终端。

`ESP32-S3` · `ESP-IDF` · `C++` · `DHT11` · `MQ135` · `GL5528` · `HLK-LD2450` · `TJC HMI` · `HTTP API` · `微信小程序` · `MCP`

- 集成语音交互、温湿度、空气质量、光照和毫米波雷达感知。
- 使用串口屏、PWM 和舵机展示环境状态与设备控制。
- 提供局域网 HTTP API、微信小程序和电脑端 MCP 桥接。
- 支持自动模式、节能模式、场景控制、事件日志与健康诊断。

### [FreeRTOS Warehouse Count & Access System](https://github.com/yythlss/FreeRTOS-Warehouse-Count-Access-System)

基于 STM32F103C8T6 与 FreeRTOS 的仓库人数统计和门禁演示系统。

`STM32F103C8T6` · `FreeRTOS` · `HC-SR04` · `OLED` · `RTC` · `TF Card` · `FatFs`

- 双路超声波传感器分别检测人员进入和离开。
- 使用 FreeRTOS 任务、消息队列和互斥锁组织并发逻辑。
- OLED 实时显示人数与时间，满员时联动 LED 和蜂鸣器。
- 人员事件及周期状态保存为 TF 卡 CSV 日志。

### [Smart Desktop Pet](https://github.com/yythlss/Smart-Desktop-Pet)

基于嘉立创开源电子宠物项目进行优化的离线语音桌面宠物。

`ASRPRO` · `LD3320` · `STC11L08XE` · `UART` · `Servo` · `Keil C51`

- 增加升压供电模块，改善舵机动作时的供电余量和稳定性。
- 增加天问 ASRPRO 离线语音识别，通过串口字符控制宠物动作。
- 支持前进、后退、转向、起身、坐下、跳舞和互动问答等口令。
- 保留 LD3320 兼容工程、口令映射表和完整调试说明。

### [Temperature Limit Alarm Based on Analog Electronics](https://github.com/yythlss/Temperature-Limit-Alarm-Based-on-Analog-Electronics)

使用纯模拟电路实现的温度窗口检测和高低温声光报警系统。

`MF58 NTC` · `LM358` · `NE555` · `Multisim 14` · `JLCEDA Pro`

- MF58 NTC 热敏电阻将温度变化转换为分压信号。
- LM358 双运放构成窗口比较器，独立判断高温与低温状态。
- 双 NE555 驱动红、蓝 LED 和蜂鸣器，实现差异化报警。
- 设计监测范围为 10 ℃～80 ℃，包含仿真、EDA 工程和课程报告。

### [Time-Limited Four-Channel Responder](https://github.com/yythlss/Time-Limited-Four-Channel-Responder-Based-on-Digital-Circuits)

基于 74LS 系列数字集成电路的四路限时抢答器。

`74LS148` · `74LS192` · `74LS373` · `74LS279` · `NE555` · `Multisim 14`

- 支持四路抢答和 0～99 秒可预置倒计时。
- 优先编码和编号锁存保证首次有效抢答结果唯一并保持显示。
- 抢答成功后停止计时并封锁后续输入，超时则触发报警。
- 提供完整系统及脉冲、计数、报警、锁存等单元仿真。

## AI & Software Projects

### [MemoStudy Agent](https://github.com/yythlss/MemoStudy-Agent)

本地优先的个人知识管理与学习助手，将散落资料转化为可检索、可问答、可复盘、可输出的知识系统。

`Python` · `FastAPI` · `Next.js` · `TypeScript` · `SQLite` · `Docker Compose` · `Ollama / OpenAI-compatible API`

- 支持 PDF、TXT、Markdown、CSV、JSON 和文件夹批量导入。
- 提供带原文引用的知识库问答、学习路径、进度复盘和研究报告。
- 默认使用本地 SQLite，可接入 Ollama、OpenAI、DeepSeek 等兼容接口。
- 包含前后端测试、Docker 部署和 GitHub Actions CI。

### [ProtoVibe Agent](https://github.com/yythlss/ProtoVibe-Agent)

面向 AI 产品原型、数字人与交互 Agent 的结构化产品工作台。

`Next.js` · `React` · `TypeScript` · `OpenAI Responses API` · `Structured Outputs` · `Zod`

- 从产品 Brief 连续生成需求洞察、PRD、交互原型和开发方案。
- 支持可运行的 HTML/CSS/JavaScript 原型、隔离预览和代码编辑。
- 提供数字人讲解、作品集叙事、独立质量审查和定向重生成。
- 支持多项目、本地版本历史、回滚，以及 Agent 暂停和断点继续。

## Tech Stack

| 方向 | 技术与工具 |
| --- | --- |
| MCU & RTOS | STM32F103、ESP32-S3、STC11、FreeRTOS |
| Embedded | C、C++、ESP-IDF、STM32CubeMX、Keil MDK / C51、IAR |
| Hardware | 传感器、UART / I2C / SPI、PWM、舵机、音频、串口屏、电源与接口电路 |
| Circuit Design | 模拟电路、数字电路、Multisim 14、嘉立创 EDA Pro |
| AI & Backend | Python、FastAPI、OpenAI-compatible API、Ollama、MCP |
| Web | TypeScript、Next.js、React、微信小程序 |
| Engineering | Git、Docker Compose、REST API、自动化测试、技术文档 |

## Current Focus

- 深入学习 STM32、FreeRTOS 和嵌入式系统调试。
- 完善智能家居中的传感器融合、执行器控制和多端交互。
- 探索 AI Agent 与真实硬件、个人知识系统和产品原型工具的结合。
- 持续把实验、比赛和课程项目整理为可复现的开源作品。

## Let's Connect

欢迎浏览项目 README、提交 Issue，或围绕嵌入式系统、智能硬件和 AI 应用进行交流。

- GitHub: [https://github.com/yythlss](https://github.com/yythlss)
