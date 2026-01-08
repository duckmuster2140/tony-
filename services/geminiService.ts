
import { GoogleGenAI } from "@google/genai";
import { MarketDataInput } from "../types";

// Fix: Escaped backticks within the template literal to prevent them from terminating the string prematurely and causing TypeScript syntax errors.
const SYSTEM_INSTRUCTION = `你是一套顶级的“庄家行为深度审计与高胜率决策系统”，专门针对新币/Alpha币/高波动币。
你的目标是维持极高的复盘胜率（目标 75%+），因此你必须极其苛刻地筛选信号。

请严格按照以下 Markdown 格式输出分析结果，确保内容专业且易于阅读：

# 【日一单决策指令】
> **核心方向**：[做多 / 做空 / 观望]
- **入场区间**：\`价格区间\`
- **止损防守**：\`价格\`
- **止盈目标**：
  - TP1: \`价格\` (建议减仓 50%)
  - TP2: \`价格\` (波段持有)
- **建议杠杆**：1-3x

---

## 🔍 庄家审计审计报告
### 1. 量价审计 (Volume & Price Audit)
[详细描述当前量能与价格的背驰或共振关系，指出庄家是在吸筹还是派发]

### 2. 持仓与筹码审计 (OI & Positioning)
[分析持仓量 (OI) 的变动逻辑，大户持仓意图，以及资金费率对盘面的压力]

### 3. 盘口异动 (Orderbook Anomalies)
[描述盘口是否存在托盘、压盘或虚假撤单等操纵行为]

---

## 📈 趋势结构图谱
- **1m/5m 周期**：[描述短期爆发力或衰竭迹象]
- **15m/1h 周期**：[描述大级别趋势支撑与压力位]

---

## 🛡️ 综合胜率评估
### **当前信号可信度：[XX]%**
[简短一句话说明为何给出此评分，当前市场最大的不确定性在哪里]

注意：必须在回复最后列出所有参考的搜索来源链接。`;

export async function analyzeMarketData(input: MarketDataInput): Promise<{ text: string; sources: any[] }> {
  // Fix: Initializing GoogleGenAI with a named parameter as required by the latest SDK guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
请立即对代币 [${input.coinName}] 进行全网深度审计。
获取币安实时数据：
- 各周期趋势与量价背离情况。
- 持仓量 (OI) 与资金费率异常。
- 最近 12 小时内的社交媒体热度与鲸鱼动向。
`;

  // Fix: Using generateContent with correct model name 'gemini-3-pro-preview' and configuration structure.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
      temperature: 0.1, // 降低随机性，确保逻辑严密
    },
  });

  // Fix: Accessing .text as a property (not a method) and extracting groundingMetadata for search sources.
  return {
    text: response.text || "数据审计失败，请检查名称。",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}
