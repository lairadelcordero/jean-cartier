import { AlertCircle, CheckCircle, Download, XCircle } from "lucide-react";
import { BRAND } from "../assets";

export function GuidelinesFullSection() {
  const dosList = [
    "Mantener espacios en blanco generosos",
    "Usar imágenes de alta calidad y bien editadas",
    "Privilegiar la tipografía sobre los gráficos",
    "Mantener jerarquías visuales claras",
    "Usar el negro como color dominante",
    "Aplicar los logos con espacio de protección adecuado",
    "Mantener consistencia en todos los puntos de contacto",
    "Usar el dorado con moderación y propósito",
  ];

  const dontsList = [
    "Saturar con demasiados elementos visuales",
    "Usar imágenes de baja calidad o pixeladas",
    "Mezclar múltiples estilos tipográficos",
    "Crear composiciones desordenadas",
    "Abusar de colores brillantes o saturados",
    "Distorsionar o modificar los logos",
    "Cambiar arbitrariamente los colores de marca",
    "Usar el dorado como color principal",
  ];

  const applications = [
    {
      name: "Digital",
      items: [
        "E-commerce y sitio web",
        "Redes sociales (Instagram, Facebook)",
        "Email marketing",
        "Publicidad digital",
        "Aplicación móvil",
      ],
    },
    {
      name: "Impreso",
      items: [
        "Catálogos de productos",
        "Lookbooks de temporada",
        "Tarjetas de presentación",
        "Packaging premium",
        "Material POS",
      ],
    },
    {
      name: "Espacios Físicos",
      items: [
        "Señalización interior",
        "Vitrinas y displays",
        "Etiquetas de precio",
        "Bolsas y packaging",
        "Uniformes del personal",
      ],
    },
  ];

  return (
    <div className="max-w-7xl px-6 py-20 lg:px-8">
      <div className="mb-16">
        <h1 className="mb-4">Guías de Uso</h1>
        <p className="max-w-3xl text-xl text-[var(--jc-gray-700)]">
          Principios y mejores prácticas para aplicar la identidad de Jean Cartier de manera
          consistente en todos los canales y puntos de contacto.
        </p>
      </div>

      <section className="mb-20">
        <h2 className="mb-8">Filosofía de Marca</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border border-[var(--jc-gray-100)] p-8">
            <div className="mb-4 text-4xl">🖤</div>
            <h3 className="mb-3">Elegancia</h3>
            <p className="text-[var(--jc-gray-700)]">
              Sofisticación sin ostentación. Cada elemento debe comunicar refinamiento natural.
            </p>
          </div>
          <div className="border border-[var(--jc-gray-100)] p-8">
            <div className="mb-4 text-4xl">✨</div>
            <h3 className="mb-3">Minimalismo</h3>
            <p className="text-[var(--jc-gray-700)]">
              Menos es más. Privilegiar el espacio, la simplicidad y la claridad visual.
            </p>
          </div>
          <div className="border border-[var(--jc-gray-100)] p-8">
            <div className="mb-4 text-4xl">🎯</div>
            <h3 className="mb-3">Atemporalidad</h3>
            <p className="text-[var(--jc-gray-700)]">
              Diseño que trasciende tendencias. Clásico y moderno a la vez.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-8">Hacer y No Hacer</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <CheckCircle size={32} className="text-green-600" />
              <h3>Recomendaciones</h3>
            </div>
            <div className="space-y-3">
              {dosList.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 border border-green-200 bg-green-50 p-4"
                >
                  <CheckCircle size={20} className="mt-0.5 flex-shrink-0 text-green-600" />
                  <span className="text-sm text-[var(--jc-gray-900)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-6 flex items-center gap-3">
              <XCircle size={32} className="text-red-600" />
              <h3>Evitar</h3>
            </div>
            <div className="space-y-3">
              {dontsList.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 border border-red-200 bg-red-50 p-4"
                >
                  <XCircle size={20} className="mt-0.5 flex-shrink-0 text-red-600" />
                  <span className="text-sm text-[var(--jc-gray-900)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-4">Aplicaciones de Marca</h2>
        <p className="mb-8 max-w-2xl text-[var(--jc-gray-700)]">
          La identidad de Jean Cartier debe aplicarse consistentemente en todos los canales.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {applications.map((app) => (
            <div
              key={app.name}
              className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-6"
            >
              <h4 className="mb-4 border-b border-[var(--jc-gray-100)] pb-4">{app.name}</h4>
              <ul className="space-y-3">
                {app.items.map((item) => (
                  <li
                    key={`${app.name}-${item}`}
                    className="flex items-start gap-2 text-sm text-[var(--jc-gray-700)]"
                  >
                    <span className="mt-1 text-[var(--jc-gray-300)]">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-8">Guía Fotográfica</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <div className="border border-[var(--jc-gray-100)] p-6">
              <h4 className="mb-3">Estilo Visual</h4>
              <ul className="space-y-2 text-sm text-[var(--jc-gray-700)]">
                <li>• Iluminación natural y suave</li>
                <li>• Fondos limpios y minimalistas</li>
                <li>• Composiciones equilibradas</li>
                <li>• Paleta de colores neutros</li>
                <li>• Enfoque en el producto</li>
              </ul>
            </div>
            <div className="border border-[var(--jc-gray-100)] p-6">
              <h4 className="mb-3">Tratamiento</h4>
              <ul className="space-y-2 text-sm text-[var(--jc-gray-700)]">
                <li>• Edición sutil y natural</li>
                <li>• Evitar filtros excesivos</li>
                <li>• Mantener colores fieles al producto</li>
                <li>• Alta resolución y nitidez</li>
              </ul>
            </div>
          </div>
          <div className="flex aspect-[4/5] items-center justify-center bg-[var(--jc-gray-100)] text-[var(--jc-gray-500)]">
            Ejemplo de fotografía de producto
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-8">Tono de Comunicación</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-[var(--jc-gray-50)] p-8">
            <h4 className="mb-4">Personalidad de Marca</h4>
            <div className="space-y-4 text-[var(--jc-gray-700)]">
              <p>
                <strong>Elegante</strong> pero no pretencioso
              </p>
              <p>
                <strong>Sofisticado</strong> pero accesible
              </p>
              <p>
                <strong>Confiable</strong> y profesional
              </p>
              <p>
                <strong>Moderno</strong> con raíces clásicas
              </p>
            </div>
          </div>
          <div className="bg-[var(--jc-gray-50)] p-8">
            <h4 className="mb-4">Estilo de Escritura</h4>
            <div className="space-y-4 text-[var(--jc-gray-700)]">
              <p>✓ Frases concisas y claras</p>
              <p>✓ Lenguaje pulido pero natural</p>
              <p>✓ Evitar jerga excesiva</p>
              <p>✓ Enfoque en beneficios y calidad</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-8">Mejores Prácticas Digitales</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4 border border-[var(--jc-gray-100)] p-6">
            <AlertCircle className="flex-shrink-0 text-[var(--jc-gold)]" size={24} />
            <div>
              <h4 className="mb-2">Responsive Design</h4>
              <p className="text-sm text-[var(--jc-gray-700)]">
                La experiencia debe ser impecable en todos los dispositivos. Priorizar mobile-first
                con navegación clara y tiempos de carga rápidos.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 border border-[var(--jc-gray-100)] p-6">
            <AlertCircle className="flex-shrink-0 text-[var(--jc-gold)]" size={24} />
            <div>
              <h4 className="mb-2">Microinteracciones</h4>
              <p className="text-sm text-[var(--jc-gray-700)]">
                Usar transiciones suaves y animaciones sutiles. Los efectos deben ser elegantes, no
                distractivos. Duración recomendada: 200-300ms.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 border border-[var(--jc-gray-100)] p-6">
            <AlertCircle className="flex-shrink-0 text-[var(--jc-gold)]" size={24} />
            <div>
              <h4 className="mb-2">Rendimiento</h4>
              <p className="text-sm text-[var(--jc-gray-700)]">
                Optimizar imágenes (WebP preferido), usar lazy loading, y mantener el código limpio.
                La velocidad es parte de la experiencia de lujo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="-mx-6 bg-[var(--jc-gray-50)] px-6 py-16 lg:-mx-8 lg:px-8">
        <div className="max-w-4xl">
          <h2 className="mb-8">Recursos y Descargas</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <a
              href={BRAND.logoNegro}
              download
              className="group flex items-center justify-between border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-6 transition-colors hover:border-[var(--jc-black)]"
            >
              <div className="text-left">
                <h4 className="mb-1">Logos Completos</h4>
                <p className="text-sm text-[var(--jc-gray-700)]">Todas las versiones en SVG</p>
              </div>
              <Download
                className="text-[var(--jc-gray-500)] transition-colors group-hover:text-[var(--jc-black)]"
                size={24}
              />
            </a>
            <button
              type="button"
              className="group flex items-center justify-between border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-6 text-left transition-colors hover:border-[var(--jc-black)]"
            >
              <div>
                <h4 className="mb-1">Paleta de Colores</h4>
                <p className="text-sm text-[var(--jc-gray-700)]">ASE, CSS, Sketch</p>
              </div>
              <Download
                className="text-[var(--jc-gray-500)] transition-colors group-hover:text-[var(--jc-black)]"
                size={24}
              />
            </button>
            <button
              type="button"
              className="group flex items-center justify-between border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-6 text-left transition-colors hover:border-[var(--jc-black)]"
            >
              <div>
                <h4 className="mb-1">Fuente Fustat</h4>
                <p className="text-sm text-[var(--jc-gray-700)]">Web fonts y desktop</p>
              </div>
              <Download
                className="text-[var(--jc-gray-500)] transition-colors group-hover:text-[var(--jc-black)]"
                size={24}
              />
            </button>
            <button
              type="button"
              className="group flex items-center justify-between border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-6 text-left transition-colors hover:border-[var(--jc-black)]"
            >
              <div>
                <h4 className="mb-1">Templates</h4>
                <p className="text-sm text-[var(--jc-gray-700)]">Photoshop, Figma, Sketch</p>
              </div>
              <Download
                className="text-[var(--jc-gray-500)] transition-colors group-hover:text-[var(--jc-black)]"
                size={24}
              />
            </button>
          </div>
          <div className="mt-12 border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-8">
            <h4 className="mb-4">Contacto para Dudas</h4>
            <p className="mb-4 text-sm text-[var(--jc-gray-700)]">
              Si tienes preguntas sobre la aplicación de la marca o necesitas aprobación para usos
              especiales, contacta al equipo de branding:
            </p>
            <a
              href="mailto:brand@jeancartier.com"
              className="text-sm underline underline-offset-4 transition-colors hover:text-[var(--jc-gray-700)]"
            >
              brand@jeancartier.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
