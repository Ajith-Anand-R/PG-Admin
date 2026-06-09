import type { Metadata, Viewport } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PG Admin | Platform Administration",
  description: "Centralized super administrator dashboard for the PG Multi-Tenant SaaS platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PG Admin",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} antialiased h-full`}
    >
      <body className="bg-slate-50/50 text-slate-900 min-h-full font-sans flex flex-col">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                  }).then(
                    function(registration) {
                      console.log('Admin ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Admin ServiceWorker registration failed: ', err);
                    }
                  );
                });

                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                  if (refreshing) return;
                  if (navigator.serviceWorker.controller) {
                    refreshing = true;
                    window.location.reload();
                  }
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
