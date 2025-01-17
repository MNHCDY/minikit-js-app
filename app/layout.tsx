import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MiniKitProvider from "@/components/minikit-provider";
import dynamic from "next/dynamic";
import NextAuthProvider from "@/components/next-auth-provider";
import { ToastContainer } from "react-toastify";
import { FooterProvider } from "./hooks/FooterContext";

const inter = Inter({ subsets: ["latin"] });

// Dynamically import the Footer as a client component
const Footer = dynamic(() => import("@/components/Homepage/Footer"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Drink Flojo",
  description: "Get Rewards here on World Coin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ErudaProvider = dynamic(
    () => import("../components/Eruda").then((c) => c.ErudaProvider),
    {
      ssr: false,
    }
  );

  return (
    <html lang="en">
      <NextAuthProvider>
        <ErudaProvider>
          <MiniKitProvider>
            <FooterProvider>
              <body className={inter.className}>
                {children}
                <Footer />
              </body>
              <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </FooterProvider>
          </MiniKitProvider>
        </ErudaProvider>
      </NextAuthProvider>
    </html>
  );
}
