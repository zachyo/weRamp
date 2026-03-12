import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "No-KYC sBTC On-Ramp | Buy sBTC Instantly",
  description:
    "Aggregating the best no-KYC & low-KYC fiat on-ramps to buy sBTC directly to your Stacks wallet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen flex flex-col`}>
        <Providers>
          <div className="noise-overlay flex-1">{children}</div>
        </Providers>
      </body>
    </html>
  );
}

