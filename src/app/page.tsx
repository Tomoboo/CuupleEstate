import { HelpCircle, MessageCircle } from "lucide-react";

/** LINE 友だち追加（無料相談） */
const LINE_CONSULTATION_URL = "https://lin.ee/glIMqbo";

const painPoints = [
  "家賃をどれくらいにすればいいかわからない",
  "2人入居OKの物件がなかなか見つからない",
  "初期費用をできるだけ抑えたい",
  "どちらの職場にも通いやすい駅がわからない",
  "同棲前に確認すべき条件がわからない",
  "審査に通るか不安",
  "ネットに出ている物件が本当に良いのかわからない",
] as const;

const services = [
  {
    num: "01",
    title: "ふたりの希望条件を整理",
    body: "駅・家賃・間取り・通勤時間・初期費用など、LINEで簡単に条件を整理します。",
  },
  {
    num: "02",
    title: "同棲向け物件を提案",
    body: "2人入居可、1LDK・2K・2DKなど、カップル向けに相性の良い物件を中心にご紹介します。",
  },
  {
    num: "03",
    title: "初期費用・審査もサポート",
    body: "初期費用の目安、保証会社の審査、必要書類など、申し込み前に不安な点を確認できます。",
  },
  {
    num: "04",
    title: "内見から契約まで伴走",
    body: "物件提案、内見調整、申込、契約、入居まで、スムーズに進められるようサポートします。",
  },
] as const;

const comparisonRows = [
  {
    label: "ヒアリング",
    general: "条件を聞いて物件を送る",
    ours: "ふたりの生活設計から整理",
  },
  {
    label: "提案内容",
    general: "家賃・駅だけで提案",
    ours: "通勤・初期費用・審査も考慮",
  },
  {
    label: "相談方法",
    general: "営業感が強い",
    ours: "LINEで気軽に相談",
  },
  {
    label: "対象",
    general: "単身向け提案が中心",
    ours: "同棲・2人入居向けに特化",
  },
  {
    label: "スタンス",
    general: "契約重視",
    ours: "失敗しない部屋探しを重視",
  },
] as const;

export default function Home() {
  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      {/* Hero */}
      <section
        id="hero"
        className="relative overflow-x-clip bg-gradient-to-br from-cream via-warm to-blush px-4 py-14 sm:px-6 sm:py-20 md:px-12 lg:px-24"
      >
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block max-w-[min(100%,22rem)] rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium leading-snug text-brownLight sm:px-4 sm:text-sm">
            同棲・結婚前のカップル専門
          </div>
          <h1
            id="catchcopy"
            className="jp-text jp-heading-lines font-heading mb-6 animate-fade-up text-[clamp(1.375rem,4.5vw+0.4rem,3rem)] font-bold leading-snug tracking-tight text-brown md:text-5xl md:leading-relaxed"
          >
            <span className="block">
              <span className="inline-block">ふたり暮らしの</span>
              <span className="inline-block">部屋探し、</span>
            </span>
            <span className="mt-1 block md:mt-0">失敗しないために。</span>
          </h1>
          <p
            id="subcopy"
            className="jp-text animate-fade-up animate-delay-1 mb-10 text-base leading-relaxed text-brownLight md:text-lg"
          >
            <span className="inline-block max-w-prose">
              同棲・結婚前のカップル向けに、エリア選び・家賃設定・審査・初期費用まで、不動産のプロがLINEでサポートします。
            </span>
          </p>
          <div className="animate-fade-up animate-delay-2 flex justify-center px-1">
            <a
              href={LINE_CONSULTATION_URL}
              id="cta-main"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full max-w-[min(100%,20rem)] items-center justify-center gap-2 rounded-full bg-lineGreen px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-lineGreenHover hover:shadow-xl sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-lg"
            >
              <MessageCircle aria-hidden className="size-[22px] shrink-0" />
              <span id="cta-btn-text">LINEで無料相談する</span>
            </a>
          </div>
          <p className="animate-fade-up animate-delay-3 mt-6 px-1 text-xs leading-relaxed text-brownLight sm:text-sm">
            相談無料 ／ 都内中心 ／ 同棲カップル向け
          </p>
        </div>
        <div
          className="absolute left-4 top-8 size-16 rounded-full bg-blush/30 blur-2xl sm:left-10 sm:top-10 sm:size-20"
          aria-hidden
        />
        <div
          className="absolute bottom-8 right-4 size-24 rounded-full bg-warm/50 blur-3xl sm:bottom-10 sm:right-10 sm:size-32"
          aria-hidden
        />
      </section>

      {/* Pain Points */}
      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="jp-text font-heading mb-12 text-center text-xl font-bold text-brown sm:text-2xl md:text-3xl">
            こんなお悩みありませんか？
          </h2>
          <div className="grid gap-3 sm:gap-4">
            {painPoints.map((text) => (
              <div
                key={text}
                className="jp-text flex items-start gap-3 rounded-xl bg-cream p-3.5 sm:p-4"
              >
                <HelpCircle
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-brownLight"
                />
                <span className="min-w-0 text-left text-sm sm:text-base">
                  {text}
                </span>
              </div>
            ))}
          </div>
          <p className="jp-text mt-10 text-center text-sm leading-relaxed text-brownLight sm:text-base">
            ふたり暮らしの部屋探しは、「好きな部屋を選ぶ」だけではなく、
            <br className="hidden sm:block" />
            生活・お金・審査・将来設計まで考える必要があります。
          </p>
        </div>
      </section>

      {/* Service */}
      <section className="bg-cream px-4 py-14 sm:px-6 sm:py-20 md:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="jp-text font-heading mb-10 text-center text-xl font-bold text-brown sm:mb-14 sm:text-2xl md:text-3xl">
            カップル不動産ができること
          </h2>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {services.map((item) => (
              <div
                key={item.num}
                className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-warm">
                  <span className="font-heading font-bold text-brown">
                    {item.num}
                  </span>
                </div>
                <h3 className="jp-text font-heading mb-3 text-base font-bold text-brown sm:text-lg">
                  {item.title}
                </h3>
                <p className="jp-text text-sm leading-relaxed text-brownLight">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20 md:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="jp-text font-heading mb-10 text-center text-xl font-bold text-brown sm:mb-12 sm:text-2xl md:text-3xl">
            普通の不動産屋との違い
          </h2>
          <div className="-mx-1 overflow-x-auto px-1 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[20rem] text-xs sm:min-w-0 sm:text-sm md:text-base">
              <thead>
                <tr className="border-b-2 border-blush">
                  <th className="w-[4.5rem] py-3 pl-2 pr-1 text-left font-medium text-brownLight sm:w-auto sm:px-4 sm:py-4" />
                  <th className="px-1 py-3 text-center font-medium text-brownLight sm:px-4 sm:py-4">
                    一般的な不動産
                  </th>
                  <th className="rounded-t-xl bg-warm/30 px-1 py-3 text-center text-xs font-bold text-brown sm:px-4 sm:py-4 sm:text-base">
                    カップル不動産
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-cream border-b last:border-b-0"
                  >
                    <td className="py-3 pl-2 pr-1 text-left text-brownLight sm:px-4 sm:py-4">
                      {row.label}
                    </td>
                    <td className="px-1 py-3 text-center text-brownLight sm:px-4 sm:py-4">
                      {row.general}
                    </td>
                    <td className="bg-warm/10 px-1 py-3 text-center text-[0.7rem] font-medium sm:px-4 sm:py-4 sm:text-base">
                      {row.ours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="jp-text mt-8 text-center text-xs leading-relaxed text-brownLight sm:text-sm">
            物件を紹介するだけではなく、
            <br />
            ふたりが納得して住める部屋選びをサポートします。
          </p>
        </div>
      </section>

      {/* LINE Bonus — 元HTMLが途中で切れていたため、同トーンで補完 */}
      <section className="bg-gradient-to-br from-warm to-cream px-4 py-14 sm:px-6 sm:py-20 md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-lineGreen/10 px-3 py-2 sm:px-4">
            <MessageCircle
              aria-hidden
              className="size-5 shrink-0 text-lineGreen"
            />
            <span className="text-sm font-medium text-brown">
              LINEで気軽に相談
            </span>
          </div>
          <h2 className="jp-text font-heading mb-4 text-xl font-bold text-brown sm:text-2xl md:text-3xl">
            まずはLINEで状況を教えてください
          </h2>
          <p className="jp-text mb-8 text-left text-sm leading-relaxed text-brownLight sm:text-center sm:text-base">
            希望エリアや予算が決まっていなくても大丈夫です。チャット形式で、ふたりに合う部屋探しの進め方をご案内します。
          </p>
          <a
            href={LINE_CONSULTATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full max-w-[min(100%,20rem)] items-center justify-center gap-2 rounded-full bg-lineGreen px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-lineGreenHover hover:shadow-xl sm:mx-auto sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-lg"
          >
            <MessageCircle aria-hidden className="size-[22px] shrink-0" />
            LINEで無料相談する
          </a>
        </div>
      </section>
    </div>
  );
}
