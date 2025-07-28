import type { Metadata } from "next";
import "./globals.css";

import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "sonner";
import Header from "@/components/layouts/header";
import Footer from "@/components/layouts/footer";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "Mental Health Assistant",
  description: "Mental Health Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* <Header /> */}
            <main>{children}</main>
            {/* <Footer /> */}
            <Toaster richColors closeButton position="top-right" />
          </ThemeProvider>
        </body>
      </AuthProvider>
    </html>
  );
}
