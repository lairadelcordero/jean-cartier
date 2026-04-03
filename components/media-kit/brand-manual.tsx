"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BRAND } from "./assets";
import { ColorsSection } from "./sections/colors-section";
import { GuidelinesFullSection } from "./sections/guidelines-full";
import { IntroSection } from "./sections/intro-section";
import { LogosSection } from "./sections/logos-section";
import { SpacingSection } from "./sections/spacing-section";
import { TypographySection } from "./sections/typography-section";
import { UiKitSection } from "./sections/ui-kit-section";

const NAV_ITEMS = [
  { id: "intro", label: "Introducción" },
  { id: "logos", label: "Logos" },
  { id: "colors", label: "Colores" },
  { id: "typography", label: "Tipografía" },
  { id: "spacing", label: "Espaciado" },
  { id: "components", label: "Componentes" },
  { id: "guidelines", label: "Guías de Uso" },
] as const;

export function BrandManual() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("intro");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    const sections = NAV_ITEMS.map((i) => i.id);
    const handleScroll = () => {
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.top <= 150 && rect.bottom >= 150;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--jc-white)] text-jc-black">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--jc-gray-100)] bg-[var(--jc-white)]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <button
              type="button"
              onClick={() => scrollToSection("intro")}
              className="flex items-center"
            >
              <img src={BRAND.logoNegro} alt="Jean Cartier" className="h-8 w-auto" />
            </button>
            <nav className="hidden items-center gap-8 lg:flex">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm tracking-wide transition-colors ${
                    activeSection === item.id
                      ? "text-[var(--jc-black)]"
                      : "text-[var(--jc-gray-500)] hover:text-[var(--jc-black)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 lg:hidden"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-[var(--jc-gray-100)] bg-[var(--jc-white)] lg:hidden">
            <div className="mx-auto max-w-7xl space-y-4 px-6 py-6">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left text-base tracking-wide transition-colors ${
                    activeSection === item.id
                      ? "text-[var(--jc-black)]"
                      : "text-[var(--jc-gray-500)] hover:text-[var(--jc-black)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="pt-20">
        <IntroSection />
        <LogosSection />
        <ColorsSection />
        <TypographySection />
        <SpacingSection />
        <UiKitSection />
        <section id="guidelines" className="bg-[var(--jc-white)]">
          <GuidelinesFullSection />
        </section>
      </main>

      <footer className="border-t border-[var(--jc-gray-100)] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-sm text-[var(--jc-gray-500)]">
              © 2026 Jean Cartier. Todos los derechos reservados.
            </div>
            <div className="text-sm text-[var(--jc-gray-500)]">Manual de Marca · Brandguide</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
