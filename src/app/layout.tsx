import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HRIS Metrics Hub",
  description: "Monthly HR-ops metrics tracked continuously by leadership",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
