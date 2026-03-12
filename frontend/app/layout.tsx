import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        {/* We'll add the StacksProvider wrapper here in the future if needed globally, 
            but for now we can just use the Connect button directly since it handles its own state */}
        <div className="noise-overlay flex-1">{children}</div>
      </body>
    </html>
  );
}
