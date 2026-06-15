import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <>
      <Header
        user={user ? { username: user.username, isDemo: user.isDemo } : null}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
