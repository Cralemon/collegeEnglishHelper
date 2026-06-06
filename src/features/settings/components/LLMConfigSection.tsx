'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '@/components/ui';
import { useSettingsStore } from '@/features/settings';

export function LLMConfigSection() {
  const llmConfig = useSettingsStore((s) => s.llmConfig);
  const setLLMConfig = useSettingsStore((s) => s.setLLMConfig);
  const [showKey, setShowKey] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM 配置</CardTitle>
        <CardDescription>配置 AI 反馈所使用的语言模型接口</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API 地址 */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium text-ink">API 地址</label>
          <Input
            placeholder="https://api.openai.com/v1"
            value={llmConfig.apiUrl}
            onChange={(e) => setLLMConfig({ apiUrl: e.target.value })}
          />
        </div>

        {/* API Key */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium text-ink">API Key</label>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder="sk-..."
              value={llmConfig.apiKey}
              onChange={(e) => setLLMConfig({ apiKey: e.target.value })}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              aria-label={showKey ? '隐藏 API Key' : '显示 API Key'}
            >
              {showKey ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-caption text-muted">
            密钥仅存储在本地浏览器中，不会上传到任何服务器
          </p>
        </div>

        {/* 模型名称 */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium text-ink">模型名称</label>
          <Input
            placeholder="gpt-4o"
            value={llmConfig.model}
            onChange={(e) => setLLMConfig({ model: e.target.value })}
          />
          <p className="text-caption text-muted">
            支持 OpenAI 兼容接口的模型，如 gpt-4o、gpt-4-turbo、deepseek-chat 等
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
