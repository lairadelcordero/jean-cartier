import { Check, Download, X } from "lucide-react";
import { BRAND } from "../assets";

const mainLogos = [
  {
    name: "Logo Principal",
    file: BRAND.logoNegro,
    description: "Versión principal para fondos claros",
    usage: "Uso prioritario en todas las comunicaciones",
  },
  {
    name: "Logo Boxed",
    file: BRAND.logoBoxed,
    description: "Versión con contenedor",
    usage: "Para aplicaciones con fondos complejos",
  },
];

const isologos = [
  {
    name: "Isologo V1",
    file: BRAND.isologoV1,
    description: "Versión vertical sobre fondo claro",
    bg: "white" as const,
  },
  {
    name: "Isologo V1 Negative",
    file: BRAND.isologoV1Negative,
    description: "Versión vertical sobre fondo oscuro",
    bg: "black" as const,
  },
  {
    name: "Isologo V2",
    file: BRAND.isologoV2,
    description: "Versión horizontal",
    bg: "white" as const,
  },
  {
    name: "Isologo V3",
    file: BRAND.isologoV3,
    description: "Versión compacta",
    bg: "white" as const,
  },
];

const isos = [
  {
    name: "Isotipo Negro",
    file: BRAND.isoNegro,
    description: "Solo símbolo, fondo claro",
    bg: "white" as const,
  },
  {
    name: "Isotipo Blanco",
    file: BRAND.isoBlanco,
    description: "Solo símbolo, fondo oscuro",
    bg: "black" as const,
  },
];

export function LogosSection() {
  return (
    <section id="logos" className="bg-[var(--jc-gray-50)] py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="mb-4">Logos y Marca</h1>
          <p className="max-w-3xl text-xl text-[var(--jc-gray-700)]">
            El sistema de identidad de Jean Cartier incluye múltiples versiones del logo para
            adaptarse a diferentes contextos.
          </p>
        </div>

        <div className="mb-20">
          <h2 className="mb-8">Logos Principales</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {mainLogos.map((logo) => (
              <div
                key={logo.name}
                className="overflow-hidden border border-[var(--jc-gray-100)] bg-[var(--jc-white)]"
              >
                <div className="flex h-64 items-center justify-center bg-[var(--jc-gray-50)] p-12">
                  <img
                    src={logo.file}
                    alt={logo.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2">{logo.name}</h3>
                  <p className="mb-2 text-sm text-[var(--jc-gray-700)]">{logo.description}</p>
                  <p className="mb-4 text-sm text-[var(--jc-gray-500)]">{logo.usage}</p>
                  <a
                    href={logo.file}
                    download
                    className="inline-flex items-center gap-2 bg-[var(--jc-black)] px-4 py-2 text-sm text-[var(--jc-white)] transition-colors hover:bg-[var(--jc-gray-900)]"
                  >
                    <Download size={16} />
                    Descargar SVG
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="mb-4">Isologos</h2>
          <p className="mb-8 max-w-2xl text-[var(--jc-gray-700)]">
            Versiones que combinan el símbolo con el texto. Ideales para aplicaciones donde se
            necesita presencia de marca completa.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {isologos.map((logo) => (
              <div
                key={logo.name}
                className="overflow-hidden border border-[var(--jc-gray-100)] bg-[var(--jc-white)]"
              >
                <div
                  className={`flex h-64 items-center justify-center p-8 ${logo.bg === "black" ? "bg-[var(--jc-black)]" : "bg-[var(--jc-gray-50)]"}`}
                >
                  <img
                    src={logo.file}
                    alt={logo.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h4 className="mb-1 text-sm">{logo.name}</h4>
                  <p className="mb-3 text-xs text-[var(--jc-gray-700)]">{logo.description}</p>
                  <a
                    href={logo.file}
                    download
                    className="inline-flex items-center gap-1 border border-[var(--jc-gray-300)] px-3 py-2 text-xs transition-colors hover:bg-[var(--jc-gray-50)]"
                  >
                    <Download size={14} />
                    Descargar
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="mb-4">Isotipos</h2>
          <p className="mb-8 max-w-2xl text-[var(--jc-gray-700)]">
            Solo el símbolo, para aplicaciones donde el espacio es limitado.
          </p>
          <div className="grid max-w-2xl gap-6 md:grid-cols-2">
            {isos.map((logo) => (
              <div
                key={logo.name}
                className="overflow-hidden border border-[var(--jc-gray-100)] bg-[var(--jc-white)]"
              >
                <div
                  className={`flex h-64 items-center justify-center p-12 ${logo.bg === "black" ? "bg-[var(--jc-black)]" : "bg-[var(--jc-gray-50)]"}`}
                >
                  <img
                    src={logo.file}
                    alt={logo.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h4 className="mb-2">{logo.name}</h4>
                  <p className="mb-4 text-sm text-[var(--jc-gray-700)]">{logo.description}</p>
                  <a
                    href={logo.file}
                    download
                    className="inline-flex items-center gap-2 border border-[var(--jc-gray-300)] px-4 py-2 text-sm transition-colors hover:bg-[var(--jc-gray-50)]"
                  >
                    <Download size={16} />
                    Descargar
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="mb-4">Espacio de Protección</h2>
          <p className="mb-8 max-w-2xl text-[var(--jc-gray-700)]">
            El logo debe mantener un espacio mínimo alrededor, equivalente a la altura de la letra
            &quot;J&quot;.
          </p>
          <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-12">
            <div className="relative mx-auto max-w-md">
              <div className="absolute -translate-y-6 text-xs text-[var(--jc-gray-700)]">
                Espacio mínimo = altura &quot;J&quot;
              </div>
              <div className="border-2 border-dashed border-[var(--jc-gold)] p-12">
                <img src={BRAND.logoNegro} alt="Jean Cartier" className="w-full" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-8">Usos Correctos e Incorrectos</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Check size={18} className="text-green-600" />
                </div>
                <h3 className="text-lg">Correcto</h3>
              </div>
              <div className="space-y-4">
                <div className="border border-green-200 bg-green-50 p-6">
                  <img src={BRAND.logoNegro} alt="Correcto" className="mb-3 h-12" />
                  <p className="text-sm text-[var(--jc-gray-700)]">
                    Usar sobre fondo blanco o gris claro
                  </p>
                </div>
                <div className="border border-green-200 bg-green-50 p-6">
                  <img src={BRAND.logoNegro} alt="Correcto" className="mb-3 h-12" />
                  <p className="text-sm text-[var(--jc-gray-700)]">
                    Mantener proporciones originales
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <X size={18} className="text-red-600" />
                </div>
                <h3 className="text-lg">Incorrecto</h3>
              </div>
              <div className="space-y-4">
                <div className="border border-red-200 bg-red-50 p-6">
                  <img
                    src={BRAND.logoNegro}
                    alt="Incorrecto"
                    className="mb-3 h-12 opacity-50"
                    style={{ transform: "scaleX(1.5)" }}
                  />
                  <p className="text-sm text-[var(--jc-gray-700)]">
                    No distorsionar las proporciones
                  </p>
                </div>
                <div className="border border-red-200 bg-red-50 p-6">
                  <img
                    src={BRAND.logoNegro}
                    alt="Incorrecto"
                    className="mb-3 h-12"
                    style={{ filter: "hue-rotate(180deg)" }}
                  />
                  <p className="text-sm text-[var(--jc-gray-700)]">
                    No cambiar los colores de la marca
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
