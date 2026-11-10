import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rogerorlando.nl"),
  title: {
    default: "Roger Orlando — System Engineer & Digital Creator",
    template: "%s | Roger Orlando",
  },
  description: "De persoonlijke website van Roger Chjin A Foeng (Roger Orlando). System engineering, development, design en digitale projecten.",
  keywords: ["Roger Orlando", "Roger Chjin A Foeng", "System Engineer", "Developer", "Portfolio", "Technology", "Nederland"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://rogerorlando.nl",
    siteName: "Roger Orlando",
    title: "Roger Orlando — Technology, design & everything in between.",
    description: "System engineer, developer en maker. Ontdek mijn werk en projecten.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0d12",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nl"><body>{children}</body></html>;
}
