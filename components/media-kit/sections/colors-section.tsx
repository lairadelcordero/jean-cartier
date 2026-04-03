"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

const grayScale = [
  { name: "Gray 900", var: "--jc-gray-900", hex: "#1A1A1A" },
  { name: "Gray 700", var: "--jc-gray-700", hex: "#4A4A4A" },
  { name: "Gray 500", var: "--jc-gray-500", hex: "#7A7A7A" },
  { name: "Gray 300", var: "--jc-gray-300", hex: "#B0B0B0" },
  { name: "Gray 100", var: "--jc-gray-100", hex: "#E5E5E5" },
  { name: "Gray 50", var: "--jc-gray-50", hex: "#F5F5F5" },
];

const primaryColors = [
  { name: "Negro", var: "--jc-black", hex: "#000000", desc: "Color principal de marca" },
  { name: "Blanco", var: "--jc-white", hex: "#FFFFFF", desc: "Color base" },
];

const accentColors = [
  { name: "Gold", var: "--jc-gold", hex: "#C9A961", desc: "Acento de lujo" },
  { name: "Gold Light", var: "--jc-gold-light", hex: "#E8D5A8", desc: "Acento secundario" },
];

export function ColorsSection() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (name: string, value: string) => {
    void navigator.clipboard.writeText(value);
    setCopiedColor(name);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <section id="colors" className="py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="mb-4">Paleta de Colores</h1>
          <p className="max-w-3xl text-xl text-[var(--jc-gray-700)]">
            La paleta de colores de Jean Cartier refleja elegancia y minimalismo. Basada en una
            escala de grises con acentos dorados.
          </p>
        </div>

        <div className="mb-20">
          <h2 className="mb-8">Colores Principales</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {primaryColors.map((color) => (
              <div key={color.name} className="overflow-hidden border border-[var(--jc-gray-100)]">
                <div className="h-48" style={{ backgroundColor: color.hex }} />
                <div className="bg-[var(--jc-white)] p-6">
                  <h3 className="mb-2">{color.name}</h3>
                  <p className="mb-4 text-sm text-[var(--jc-gray-700)]">{color.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs text-[var(--jc-gray-500)]">HEX</div>
                      <div className="font-mono text-sm">{color.hex}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(color.name, color.hex)}
                      className="p-2 transition-colors hover:bg-[var(--jc-gray-50)]"
                      aria-label={`Copy ${color.name}`}
                    >
                      {copiedColor === color.name ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                  <div className="mt-3 border-t border-[var(--jc-gray-100)] pt-3">
                    <div className="mb-1 text-xs text-[var(--jc-gray-500)]">CSS Variable</div>
                    <div className="font-mono text-sm">var({color.var})</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="mb-4">Escala de Grises</h2>
          <p className="mb-8 max-w-2xl text-[var(--jc-gray-700)]">
            Seis valores cuidadosamente calibrados para crear jerarquías visuales sutiles y
            elegantes.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {grayScale.map((color) => (
              <div key={color.name} className="overflow-hidden border border-[var(--jc-gray-100)]">
                <div className="h-32" style={{ backgroundColor: color.hex }} />
                <div className="bg-[var(--jc-white)] p-6">
                  <h4 className="mb-3">{color.name}</h4>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs text-[var(--jc-gray-500)]">HEX</div>
                      <div className="font-mono text-sm">{color.hex}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(color.name, color.hex)}
                      className="p-2 transition-colors hover:bg-[var(--jc-gray-50)]"
                      aria-label={`Copy ${color.name}`}
                    >
                      {copiedColor === color.name ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                  <div className="border-t border-[var(--jc-gray-100)] pt-3">
                    <div className="mb-1 text-xs text-[var(--jc-gray-500)]">CSS Variable</div>
                    <div className="break-all font-mono text-xs">var({color.var})</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4">Colores de Acento</h2>
          <p className="mb-8 max-w-2xl text-[var(--jc-gray-700)]">
            Toques dorados que aportan elegancia y distinción. Usar con moderación.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {accentColors.map((color) => (
              <div key={color.name} className="overflow-hidden border border-[var(--jc-gray-100)]">
                <div className="h-48" style={{ backgroundColor: color.hex }} />
                <div className="bg-[var(--jc-white)] p-6">
                  <h3 className="mb-2">{color.name}</h3>
                  <p className="mb-4 text-sm text-[var(--jc-gray-700)]">{color.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs text-[var(--jc-gray-500)]">HEX</div>
                      <div className="font-mono text-sm">{color.hex}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(color.name, color.hex)}
                      className="p-2 transition-colors hover:bg-[var(--jc-gray-50)]"
                      aria-label={`Copy ${color.name}`}
                    >
                      {copiedColor === color.name ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                  <div className="mt-3 border-t border-[var(--jc-gray-100)] pt-3">
                    <div className="mb-1 text-xs text-[var(--jc-gray-500)]">CSS Variable</div>
                    <div className="font-mono text-sm">var({color.var})</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
