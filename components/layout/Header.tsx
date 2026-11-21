"use client";

import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { AnchorLink } from "@/components/layout/AnchorLink";
import { Brand } from "@/components/layout/Brand";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useModals } from "@/components/modals/ModalProvider";
import { site } from "@/lib/content/site";

/** Site header + mobile menu (POC .site-header / .mobile-menu). */
export function Header() {
  const { openApply, openAssessment } = useModals();
  const [menuOpen, setMenuOpen] = useState(false);

  /* lock page scroll while the mobile menu is open; close on Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="site-header">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {site.nav.map((item) => (
            <AnchorLink key={item.href} href={`/${item.href}`}>
              {item.label}
            </AnchorLink>
          ))}
        </nav>
        <div className="nav-actions">
          <button type="button" className="nav-link-button" onClick={openAssessment}>
            Free assessment
          </button>
          <button type="button" className="button button-small button-gold" onClick={() => openApply()}>
            Apply now{" "}
          </button>
        </div>
        <button
          type="button"
          className={clsx("menu-toggle", menuOpen && "open")}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i />
          <i />
        </button>
      </header>
      <MobileMenu
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
        onApply={() => {
          setMenuOpen(false);
          openApply();
        }}
      />
    </>
  );
}
