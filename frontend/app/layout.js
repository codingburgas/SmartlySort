import { Fira_Sans, Fira_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { WarehouseProvider } from "@/components/WarehouseProvider";
import { AppShell } from "@/components/AppShell";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "SmartlySort — Inventory Management",
  description: "Warehouse-scoped inventory management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${firaSans.variable} ${firaCode.variable}`}>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <WarehouseProvider>
              <AppShell>
                {children}
              </AppShell>
            </WarehouseProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
