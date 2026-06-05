'use client';

import { useTheme } from '@/hooks/useTheme';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Textarea,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';

export default function Home() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return null;
  }

  return (
    <main className="flex-1 p-4 md:p-8 lg:p-12">
      <div className="mx-auto max-w-4xl space-y-4 md:space-y-8 lg:space-y-12">
        {/* Header */}
        <header className="text-center">
          <h1 className="font-display text-display-lg text-ink">
            设计系统预览
          </h1>
          <p className="mt-2 text-body-md text-muted">
            大学英语翻译练习助手 — Claude 风格设计
          </p>
        </header>

        {/* Theme Switcher */}
        <Card>
          <CardHeader>
            <CardTitle>主题切换</CardTitle>
            <CardDescription>当前主题：{theme === 'system' ? '跟随系统' : theme === 'dark' ? '深色' : '浅色'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'primary' : 'outline'}
                onClick={() => setTheme('light')}
              >
                ☀️ 浅色
              </Button>
              <Button
                variant={theme === 'dark' ? 'primary' : 'outline'}
                onClick={() => setTheme('dark')}
              >
                🌙 深色
              </Button>
              <Button
                variant={theme === 'system' ? 'primary' : 'outline'}
                onClick={() => setTheme('system')}
              >
                🎨 跟随系统
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle>色彩系统</CardTitle>
            <CardDescription>Claude 风格配色方案</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <div className="h-16 rounded-md bg-primary" />
                <p className="text-sm text-muted">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-md bg-primary-active" />
                <p className="text-sm text-muted">Primary Active</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-md bg-canvas border border-hairline" />
                <p className="text-sm text-muted">Canvas</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-md bg-surface-card" />
                <p className="text-sm text-muted">Surface Card</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-md bg-success" />
                <p className="text-sm text-muted">Success</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-md bg-warning" />
                <p className="text-sm text-muted">Warning</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-md bg-error" />
                <p className="text-sm text-muted">Error</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-md bg-hairline" />
                <p className="text-sm text-muted">Hairline</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>字体排版</CardTitle>
            <CardDescription>EB Garamond / Source Han Serif (Display) + Sarasa Gothic (Body)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-display-xl text-ink">Display XL</p>
              <p className="text-body-sm text-muted">64px / weight 400 / line-height 1.05 / letter-spacing -1.5px</p>
            </div>
            <div>
              <p className="text-display-lg text-ink">Display LG</p>
              <p className="text-body-sm text-muted">48px / weight 400 / line-height 1.1 / letter-spacing -1px</p>
            </div>
            <div>
              <p className="text-display-md text-ink">Display MD</p>
              <p className="text-body-sm text-muted">36px / weight 400 / line-height 1.15 / letter-spacing -0.5px</p>
            </div>
            <div>
              <p className="text-display-sm text-ink">Display SM</p>
              <p className="text-body-sm text-muted">28px / weight 400 / line-height 1.2 / letter-spacing -0.3px</p>
            </div>
            <div>
              <p className="text-title-lg text-ink">Title LG</p>
              <p className="text-body-sm text-muted">22px / weight 500 / line-height 1.3</p>
            </div>
            <div>
              <p className="text-title-md text-ink">Title MD</p>
              <p className="text-body-sm text-muted">18px / weight 500 / line-height 1.4</p>
            </div>
            <div>
              <p className="text-body-md text-ink">
                这是正文内容，使用 Sarasa Gothic 字体。The quick brown fox jumps over the lazy dog.
              </p>
              <p className="text-body-sm text-muted">16px / weight 400 / line-height 1.55</p>
            </div>
            <div>
              <p className="text-body-sm text-ink">这是辅助文字，用于说明和注释。</p>
              <p className="text-body-sm text-muted">14px / weight 400 / line-height 1.55</p>
            </div>
            <div>
              <p className="text-caption text-ink">CAPTION LABEL</p>
              <p className="text-body-sm text-muted">13px / weight 500 / line-height 1.4</p>
            </div>
            <div>
              <p className="text-code text-ink">const hello = "world";</p>
              <p className="text-body-sm text-muted">14px / JetBrains Mono / weight 400 / line-height 1.6</p>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>按钮组件</CardTitle>
            <CardDescription>多种变体和尺寸</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>输入组件</CardTitle>
            <CardDescription>Input 和 Textarea</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="默认输入框" />
            <Input placeholder="错误状态" error="此字段为必填项" />
            <Textarea placeholder="多行文本输入框" />
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>徽章组件</CardTitle>
            <CardDescription>多种状态和尺寸</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>标签页组件</CardTitle>
            <CardDescription>多种样式变体</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <p className="mb-2 text-sm text-muted">Default 变体</p>
              <Tabs defaultValue="tab1">
                <TabsList>
                  <TabsTrigger value="tab1">标签一</TabsTrigger>
                  <TabsTrigger value="tab2">标签二</TabsTrigger>
                  <TabsTrigger value="tab3">标签三</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                  <p className="text-body-md text-body">这是标签一的内容</p>
                </TabsContent>
                <TabsContent value="tab2">
                  <p className="text-body-md text-body">这是标签二的内容</p>
                </TabsContent>
                <TabsContent value="tab3">
                  <p className="text-body-md text-body">这是标签三的内容</p>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <p className="mb-2 text-sm text-muted">Pills 变体</p>
              <Tabs defaultValue="pill1">
                <TabsList variant="pills">
                  <TabsTrigger variant="pills" value="pill1">语法</TabsTrigger>
                  <TabsTrigger variant="pills" value="pill2">词汇</TabsTrigger>
                  <TabsTrigger variant="pills" value="pill3">句型</TabsTrigger>
                </TabsList>
                <TabsContent value="pill1">
                  <p className="text-body-md text-body">语法相关内容</p>
                </TabsContent>
                <TabsContent value="pill2">
                  <p className="text-body-md text-body">词汇相关内容</p>
                </TabsContent>
                <TabsContent value="pill3">
                  <p className="text-body-md text-body">句型相关内容</p>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Card Variants */}
        <Card>
          <CardHeader>
            <CardTitle>卡片变体</CardTitle>
            <CardDescription>多种卡片样式</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card variant="default">
                <CardContent>
                  <p className="text-body-md text-body">Default 卡片</p>
                </CardContent>
              </Card>
              <Card variant="elevated">
                <CardContent>
                  <p className="text-body-md text-body">Elevated 卡片</p>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent>
                  <p className="text-body-md text-body">Outlined 卡片</p>
                </CardContent>
              </Card>
              <Card variant="filled">
                <CardContent>
                  <p className="text-body-md text-body">Filled 卡片</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center text-sm text-muted">
          <p>设计系统预览 — 大学英语翻译练习助手</p>
          <p className="mt-1">Step 2 完成 ✅</p>
        </footer>
      </div>
    </main>
  );
}
