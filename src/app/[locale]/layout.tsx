import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import "./globals.css";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import theme from "@/theme";
import { CssBaseline } from "@mui/material";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cyber Company",
  description: "AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navigation />
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
