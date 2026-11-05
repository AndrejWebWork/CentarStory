import type { Metadata, Viewport } from "next";
import { Onest, Unbounded } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import { languageAlternates, siteOrigin } from "@/lib/seo/site";
import "./globals.css";

const display = Unbounded({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
});

const sans = Onest({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const description = t("description");
  return {
    metadataBase: new URL(siteOrigin()),
    applicationName: "CentarStory",
    title: {
      default: t("title"),
      template: t("template"),
    },
    description,
    keywords: t("keywords").split(", "),
    authors: [{ name: "CentarStory" }],
    creator: "CentarStory",
    category: "travel",
    alternates: {
      languages: languageAlternates("/"),
    },
    openGraph: {
      type: "website",
      siteName: "CentarStory",
      title: t("title"),
      description,
      images: [{ url: "/brand/logo.jpg", alt: "CentarStory" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description,
      images: ["/brand/logo.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
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
      <body className={`${sans.className} min-h-full bg-paper text-ink antialiased`}>{children}</body>
    </html>
  );
}
