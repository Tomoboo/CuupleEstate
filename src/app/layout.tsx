import type { Metadata } from "next";
import { Noto_Sans_JP, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  variable: "--font-heading",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "カップル不動産",
  description:
    "同棲・結婚前のカップル向けに、エリア選び・家賃設定・審査・初期費用まで不動産のプロがLINEでサポートします。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${zenMaruGothic.variable} ${notoSansJP.variable} h-full antialiased`}
    >
      <body className="font-body h-full overflow-auto bg-cream text-navy">
        {children}
      </body>
    </html>
  );
}
