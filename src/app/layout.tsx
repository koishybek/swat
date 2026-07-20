import type { Metadata, Viewport } from "next";
import { Golos_Text, JetBrains_Mono, Oswald } from "next/font/google";
import "./globals.css";

/* Узкий гротеск американских вывесок — заголовки и печать. */
const oswald = Oswald({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

/* Кириллица-first гротеск — весь читаемый текст. */
const golos = Golos_Text({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-golos",
  display: "swap",
});

/* Моноширинный — все суммы и подписи граф, как на настоящей расчётке. */
const jetbrains = JetBrains_Mono({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SWAT — сколько ты реально заработаешь на Work and Travel",
    template: "%s · SWAT",
  },
  description:
    "Считаем чистый заработок за сезон в США: ставка, часы, жильё, налоги и стоимость программы. Показываем офферы, в которые ехать не стоит.",
  keywords: [
    "work and travel",
    "ворк энд тревел",
    "J-1",
    "работа в США студентам",
    "сколько заработать work and travel",
    "Казахстан",
  ],
  openGraph: {
    title: "SWAT — сначала цифры, потом океан",
    description:
      "Калькулятор чистого заработка за сезон Work and Travel: что начислят, что удержат и что реально останется на руках.",
    locale: "ru_RU",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f5f3ea",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${oswald.variable} ${golos.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
