import type { Metadata, Viewport } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";

const display = EB_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--font-eb",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--font-manrope",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1c1612",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    applicationName: "CentarStory",
    title: {
      default: t("title"),
      template: t("template"),
    },
    description: t("description"),
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: "CentarStory",
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${sans.variable} h-full`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
