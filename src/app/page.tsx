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
    <div className="w-full">
      {/* Hero */}
      <section
        id="hero"
        className="relative bg-gradient-to-br from-cream via-warm to-blush px-6 py-20 md:px-12 lg:px-24"
      >
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-brownLight">
            同棲・結婚前のカップル専門
          </div>
          <h1
            id="catchcopy"
            className="font-heading mb-6 animate-fade-up text-3xl leading-relaxed font-bold text-brown md:text-5xl"
          >
            ふたり暮らしの部屋探し、
            <br />
            失敗しないために。
          </h1>
          <p
            id="subcopy"
            className="animate-fade-up animate-delay-1 mb-10 text-base leading-relaxed text-brownLight md:text-lg"
          >
            同棲・結婚前のカップル向けに、
            <br className="md:hidden" />
            エリア選び・家賃設定・審査・初期費用まで、
            <br />
            不動産のプロがLINEでサポートします。
          </p>
          <div className="animate-fade-up animate-delay-2 flex justify-center">
            <a
              href={LINE_CONSULTATION_URL}
              id="cta-main"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-lineGreen px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-lineGreenHover hover:shadow-xl"
            >
              <MessageCircle aria-hidden className="size-[22px] shrink-0" />
              <span id="cta-btn-text">LINEで無料相談する</span>
            </a>
          </div>
          <p className="animate-fade-up animate-delay-3 mt-6 text-sm text-brownLight">
            相談無料 ／ 都内中心 ／ 同棲カップル向け
          </p>
        </div>
        <div
          className="absolute left-10 top-10 size-20 rounded-full bg-blush/30 blur-2xl"
          aria-hidden
        />
        <div
          className="absolute bottom-10 right-10 size-32 rounded-full bg-warm/50 blur-3xl"
          aria-hidden
        />
      </section>

      {/* Pain Points */}
      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading mb-12 text-center text-2xl font-bold text-brown md:text-3xl">
            こんなお悩みありませんか？
          </h2>
          <div className="grid gap-4">
            {painPoints.map((text) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-xl bg-cream p-4"
              >
                <HelpCircle
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-brownLight"
                />
                <span>{text}</span>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center leading-relaxed text-brownLight">
            ふたり暮らしの部屋探しは、
            <br />
            「好きな部屋を選ぶ」だけではなく、
            <br />
            生活・お金・審査・将来設計まで考える必要があります。
          </p>
        </div>
      </section>

      {/* Service */}
      <section className="bg-cream px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-heading mb-14 text-center text-2xl font-bold text-brown md:text-3xl">
            カップル不動産ができること
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {services.map((item) => (
              <div
                key={item.num}
                className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-warm">
                  <span className="font-heading font-bold text-brown">
                    {item.num}
                  </span>
                </div>
                <h3 className="font-heading mb-3 text-lg font-bold text-brown">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-brownLight">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-heading mb-12 text-center text-2xl font-bold text-brown md:text-3xl">
            普通の不動産屋との違い
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b-2 border-blush">
                  <th className="px-4 py-4 text-left font-medium text-brownLight" />
                  <th className="px-4 py-4 text-center font-medium text-brownLight">
                    一般的な不動産
                  </th>
                  <th className="rounded-t-xl bg-warm/30 px-4 py-4 text-center font-bold text-brown">
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
                    <td className="px-4 py-4 text-brownLight">{row.label}</td>
                    <td className="px-4 py-4 text-center text-brownLight">
                      {row.general}
                    </td>
                    <td className="bg-warm/10 px-4 py-4 text-center font-medium">
                      {row.ours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-8 text-center text-sm leading-relaxed text-brownLight">
            物件を紹介するだけではなく、
            <br />
            ふたりが納得して住める部屋選びをサポートします。
          </p>
        </div>
      </section>

      {/* LINE Bonus — 元HTMLが途中で切れていたため、同トーンで補完 */}
      <section className="bg-gradient-to-br from-warm to-cream px-6 py-20 md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-lineGreen/10 px-4 py-2">
            <MessageCircle
              aria-hidden
              className="size-5 shrink-0 text-lineGreen"
            />
            <span className="text-sm font-medium text-brown">
              LINEで気軽に相談
            </span>
          </div>
          <h2 className="font-heading mb-4 text-2xl font-bold text-brown md:text-3xl">
            まずはLINEで状況を教えてください
          </h2>
          <p className="mb-8 leading-relaxed text-brownLight">
            希望エリアや予算が決まっていなくても大丈夫です。チャット形式で、ふたりに合う部屋探しの進め方をご案内します。
          </p>
          <a
            href={LINE_CONSULTATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-lineGreen px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-lineGreenHover hover:shadow-xl"
          >
            <MessageCircle aria-hidden className="size-[22px] shrink-0" />
            LINEで無料相談する
          </a>
        </div>
      </section>
    </div>
  );
}
