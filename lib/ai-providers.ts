// AI Providers - Supports domestic APIs + Agnes AI
// All providers use OpenAI-compatible format

export type AIProvider = "moonshot" | "deepseek" | "zhipu" | "qwen" | "agnes";

export interface ProviderConfig {
  baseUrl: string;
  model: string;
}

export const DEFAULT_PROVIDERS: Record<AIProvider, ProviderConfig> = {
  moonshot: {
    baseUrl: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-8k",
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
  },
  zhipu: {
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-4-flash",
  },
  qwen: {
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-turbo",
  },
  agnes: {
    baseUrl: "https://apihub.agnes-ai.com/v1",
    model: "agnes-text",
  },
};

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  moonshot: "Moonshot (Kimi)",
  deepseek: "DeepSeek",
  zhipu: "智谱 GLM",
  qwen: "通义千问",
  agnes: "Agnes AI",
};

export const PROVIDER_DESCRIPTIONS: Record<AIProvider, string> = {
  moonshot: "月之暗面 Kimi，中文理解强，速度快",
  deepseek: "深度求索，性价比高，代码能力强",
  zhipu: "智谱AI GLM-4-Flash，免费额度充足",
  qwen: "阿里通义千问，综合能力强",
  agnes: "Agnes AI (Sapiens)，多模态，兼容 OpenAI 格式",
};

// --- Unified OpenAI-compatible caller ---
async function callChatAPI(
  provider: AIProvider,
  apiKey: string,
  prompt: string
): Promise<string> {
  const config = DEFAULT_PROVIDERS[provider];
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${provider} API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// --- Main dispatcher ---
export async function callAIProvider(
  provider: AIProvider,
  apiKey: string,
  prompt: string
): Promise<string> {
  return callChatAPI(provider, apiKey, prompt);
}

// --- Try all providers in order: Agnes first, then domestic ---
export async function callAnyProvider(prompt: string): Promise<string> {
  const providerOrder: { id: AIProvider; envVar: string }[] = [
    { id: "agnes", envVar: "AGNES_API_KEY" },
    { id: "moonshot", envVar: "MOONSHOT_API_KEY" },
    { id: "deepseek", envVar: "DEEPSEEK_API_KEY" },
    { id: "zhipu", envVar: "ZHIPU_API_KEY" },
    { id: "qwen", envVar: "QWEN_API_KEY" },
  ];

  const errors: string[] = [];

  for (const { id, envVar } of providerOrder) {
    const apiKey = process.env[envVar] || "";
    if (!apiKey) {
      errors.push(`${id}: no API key set (${envVar})`);
      continue;
    }
    try {
      const result = await callAIProvider(id, apiKey, prompt);
      console.log(`[AI] Success with ${id}`);
      return result;
    } catch (e) {
      errors.push(`${id}: ${(e as Error).message}`);
      console.log(`[AI] ${id} failed:`, e);
    }
  }

  throw new Error(
    "All AI providers failed. " + errors.join(" | ") +
    ". Please set at least one API key in environment variables."
  );
}

// --- Check which providers have keys ---
export function getAvailableProviders(): {
  id: AIProvider;
  label: string;
  description: string;
  available: boolean;
}[] {
  const envKeys = Object.keys(process.env);
  const checks: { id: AIProvider; envVar: string }[] = [
    { id: "agnes", envVar: "AGNES_API_KEY" },
    { id: "moonshot", envVar: "MOONSHOT_API_KEY" },
    { id: "deepseek", envVar: "DEEPSEEK_API_KEY" },
    { id: "zhipu", envVar: "ZHIPU_API_KEY" },
    { id: "qwen", envVar: "QWEN_API_KEY" },
  ];
  return checks.map(({ id, envVar }) => ({
    id,
    label: PROVIDER_LABELS[id],
    description: PROVIDER_DESCRIPTIONS[id],
    available: !!envKeys.includes(envVar),
  }));
}
