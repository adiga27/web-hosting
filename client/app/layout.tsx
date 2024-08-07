import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../config/firebase-config"


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Hosting",
  description: "Hosting User's Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
