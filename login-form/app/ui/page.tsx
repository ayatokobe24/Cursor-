import { ImageIcon, Mail, Search, X } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from "@/src/components/ui";

export default function ComponentsPage() {
  return (
    <main className="font-body min-h-full bg-[#FAFAFA] px-12 py-12 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-heading-lg">Components</h1>
          <p className="text-body-sm text-muted">
            Button / Card / Input / Dialog — Pencil デザインの実装
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-heading-md">Button</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Button size="sm">SM</Button>
            <Button size="md">MD</Button>
            <Button size="lg">LG</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-heading-md">Card</h2>
          <div className="flex flex-wrap items-start gap-8">
            <Card className="w-[360px]">
              <CardHeader>
                <CardTitle>プロジェクト概要</CardTitle>
                <CardDescription>
                  チームの進捗と次のアクションを確認します。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[14px] leading-[1.5]">
                  今週はデザインシステムの構築とログイン画面の実装を進めました。
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">
                  Cancel
                </Button>
                <Button size="sm">Save</Button>
              </CardFooter>
            </Card>

            <Card className="w-[360px]">
              <div className="flex h-[180px] w-full items-center justify-center bg-[#F3F4F6]">
                <ImageIcon className="h-8 w-8 text-muted" aria-hidden />
              </div>
              <CardHeader>
                <CardTitle>カバー付きカード</CardTitle>
                <CardDescription>
                  上部に画像を配置したバリエーションです。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[14px] leading-[1.5]">
                  記事・商品・プロフィールなど、ビジュアルが主役のコンテンツ向けです。
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">
                  Cancel
                </Button>
                <Button size="sm">Save</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-heading-md">Input</h2>
          <div className="flex flex-wrap items-start gap-6">
            <Input className="w-[320px]" placeholder="Placeholder" />
            <Input className="w-[320px]" defaultValue="Focused value" />
          </div>
          <div className="flex flex-wrap items-start gap-6">
            <Input
              className="w-[320px]"
              label="Email"
              required
              placeholder="you@example.com"
            />
            <Input
              className="w-[320px]"
              label="Email"
              required
              defaultValue="invalid-email"
              error="Please enter a valid email address."
            />
            <Input
              className="w-[320px]"
              placeholder="Search…"
              leftIcon={<Search />}
              rightIcon={<X />}
            />
          </div>
          <div className="flex flex-wrap items-end gap-6">
            <Input className="w-[280px]" size="sm" placeholder="Small input" />
            <Input className="w-[280px]" size="md" placeholder="Medium input" />
            <Input className="w-[280px]" size="lg" placeholder="Large input" />
          </div>
          <Input
            className="w-[320px]"
            label="メールアドレス"
            leftIcon={<Mail />}
            placeholder="you@example.com"
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-heading-md">Dialog</h2>
          <Dialog>
            <DialogTrigger>ダイアログを開く</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>変更を保存しますか？</DialogTitle>
                <DialogDescription>
                  保存すると、現在の内容で上書きされます。
                </DialogDescription>
              </DialogHeader>
              <div className="px-5 py-4 text-[14px] leading-[1.5] text-foreground">
                この操作はあとから元に戻せます。
              </div>
              <DialogFooter>
                <DialogClose variant="ghost" size="sm">
                  Cancel
                </DialogClose>
                <DialogClose size="sm">Save</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </main>
  );
}
