const NAV = [
  { href: '#menu', label: 'Menu' },
  { href: '#calendar', label: 'Calendar' },
  { href: '#contact', label: 'Contact' },
] as const

const MENUS = [
  {
    name: 'おいしい牛乳 900ml',
    price: '¥248',
    image:
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=80',
    alt: 'グラスに注がれた牛乳',
  },
  {
    name: 'おいしい低脂肪牛乳',
    price: '¥228',
    image:
      'https://images.unsplash.com/photo-1576186726188-c9d70843790f?auto=format&fit=crop&w=900&q=80',
    alt: 'ガラス瓶に入った牛乳',
  },
  {
    name: '濃厚ミルク 定期便',
    price: '¥4,000 /月',
    image:
      'https://images.unsplash.com/photo-1678314609962-1028f2bce919?auto=format&fit=crop&w=900&q=80',
    alt: '新鮮な牛乳のクローズアップ',
  },
] as const

const WEEK = [
  { day: '月', open: '10:00–19:00' },
  { day: '火', open: '10:00–19:00' },
  { day: '水', open: '定休' },
  { day: '木', open: '10:00–19:00' },
  { day: '金', open: '10:00–19:00' },
  { day: '土', open: '10:00–18:00' },
  { day: '日', open: '10:00–18:00' },
] as const

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1920&q=80'

function App() {
  function goTop() {
    window.history.replaceState(null, '', '#top')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div id="top" className="min-h-screen bg-white text-ink">
      <header className="sticky top-0 z-20 border-b border-sky/20 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-[min(1120px,calc(100%-32px))] items-center justify-between gap-4">
          <a
            href="#top"
            className="flex items-center font-bold text-navy"
            aria-label="明治"
            onClick={(event) => {
              event.preventDefault()
              goTop()
            }}
          >
            <span className="grid h-9 w-14 place-items-center rounded-md bg-navy text-sm text-white">
              明治
            </span>
          </a>
          <nav className="flex items-center gap-4 text-sm font-medium text-navy sm:gap-8" aria-label="メイン">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-sky">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section
          className="relative isolate flex min-h-[78vh] items-center bg-navy-deep bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-label="ヒーロー"
        >
          <div className="absolute inset-0 bg-navy-deep/55" />
          <div className="relative mx-auto w-[min(1120px,calc(100%-32px))] py-24">
            <p className="mb-4 text-sm font-semibold tracking-[0.28em] text-white/80">
              MEIJI OISHII GYUNYU
            </p>
            <h1 className="max-w-3xl text-3xl font-bold leading-snug text-white md:text-5xl">
              最高級のコクとうまみがあなたを日常から解放します
            </h1>
          </div>
        </section>

        <section id="menu" className="scroll-mt-20 bg-mist py-20">
          <div className="mx-auto w-[min(1120px,calc(100%-32px))]">
            <p className="text-sm font-semibold tracking-[0.2em] text-sky">MENU</p>
            <h2 className="mt-2 text-3xl font-bold text-navy">おすすめメニュー</h2>
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {MENUS.map((item) => (
                <li key={item.name} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <img src={item.image} alt={item.alt} className="h-48 w-full object-cover" />
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-navy">{item.name}</h3>
                    <p className="mt-2 text-2xl font-bold text-sky">{item.price}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-12 text-center">
              <a
                href="#calendar"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-navy px-8 font-semibold text-white hover:bg-navy-deep"
              >
                営業カレンダーを見る
              </a>
            </div>
          </div>
        </section>

        <section id="calendar" className="scroll-mt-20 bg-white py-20">
          <div className="mx-auto w-[min(1120px,calc(100%-32px))]">
            <p className="text-sm font-semibold tracking-[0.2em] text-sky">CALENDAR</p>
            <h2 className="mt-2 text-3xl font-bold text-navy">営業カレンダー</h2>
            <p className="mt-3 text-muted">今週の営業時間です。水曜日は定休日です。</p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
              {WEEK.map((item) => {
                const closed = item.open === '定休'
                return (
                  <div
                    key={item.day}
                    className={`rounded-2xl border p-4 text-center ${
                      closed
                        ? 'border-sky/20 bg-mist text-muted'
                        : 'border-navy/10 bg-white text-navy'
                    }`}
                  >
                    <p className="text-sm font-semibold">{item.day}</p>
                    <p className="mt-2 text-sm">{item.open}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="scroll-mt-20 bg-navy text-white">
        <div className="mx-auto grid w-[min(1120px,calc(100%-32px))] gap-10 py-14 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold">営業時間</h2>
            <p className="mt-3 text-white/80">平日 10:00–19:00</p>
            <p className="text-white/80">土日祝 10:00–18:00</p>
            <p className="text-white/80">水曜定休</p>
          </div>
          <div>
            <h2 className="text-xl font-bold">連絡先</h2>
            <p className="mt-3 text-white/80">電話 0120-00-1916</p>
            <p className="text-white/80">メール hello@meiji-milk.example</p>
            <p className="text-white/80">東京都千代田区神田駿河台2-4-6</p>
          </div>
        </div>
        <p className="border-t border-white/15 py-4 text-center text-xs text-white/60">
          © 明治おいしい牛乳 LP（教材用の非公式デモ）
        </p>
      </footer>
    </div>
  )
}

export default App
