import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata = { title: "Exness Pro" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="h-[calc(100vh-56px)]">{children}</main>
      </body>
    </html>
  );
}
