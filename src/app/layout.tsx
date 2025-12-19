import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ekko CRM - Voice-First AI Assistant",
  description: "Manage your contacts and tasks with AI-powered voice commands",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-gray-950 text-white`}>
        <Sidebar />
        <main className="pl-64 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
