import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import MotionProvider from "@/components/motion/MotionProvider";
import { footerLinks, navLinks } from "@/constants/landing";
import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <Navbar links={navLinks} />
      <main className="overflow-x-clip">{children}</main>
      <Footer links={footerLinks} />
    </MotionProvider>
  );
}
