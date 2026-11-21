import type { Metadata, Viewport } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-eb",
  display: "swap",
});

const description =
  "A conversation kept to the Bible — its books, verses, people, history, and the life Scripture shapes.";

export const metadata: Metadata = {
  metadataBase: new URL("https://1688.bible"),
  title: "1688.bible",
  description,
  applicationName: "1688.bible",
  alternates: { canonical: "/" },
  openGraph: {
    title: "1688.bible",
    description,
    url: "https://1688.bible",
    siteName: "1688.bible",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "A gold crown of Christ above the navy wordmark 1688.bible",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "1688.bible",
    description,
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#fdf9f0",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
