import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { ModalProvider } from "@/components/modals/ModalProvider";

/** Public site chrome: modal context + header. Each page renders its own <main> and footer placement. */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <ModalProvider>
      <Header />
      {children}
    </ModalProvider>
  );
}
