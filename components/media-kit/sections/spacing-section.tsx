const spacingScale = [
  { value: "4px", name: "xs", usage: "Espaciado mínimo, elementos muy cercanos" },
  { value: "8px", name: "sm", usage: "Separación entre elementos relacionados" },
  { value: "16px", name: "md", usage: "Espaciado estándar (base)" },
  { value: "24px", name: "lg", usage: "Separación entre grupos de elementos" },
  { value: "32px", name: "xl", usage: "Separación entre secciones pequeñas" },
  { value: "48px", name: "2xl", usage: "Separación entre secciones medianas" },
  { value: "64px", name: "3xl", usage: "Separación entre secciones grandes" },
  { value: "96px", name: "4xl", usage: "Espaciado dramático, héroes" },
];

export function SpacingSection() {
  return (
    <section id="spacing" className="py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="mb-4">Sistema de Espaciado</h1>
          <p className="max-w-3xl text-xl text-[var(--jc-gray-700)]">
            Un sistema de espaciado consistente basado en múltiplos de 8px crea ritmo visual y
            armonía.
          </p>
        </div>

        <div className="mb-20">
          <h2 className="mb-8">Escala de Espaciado</h2>
          <div className="space-y-6">
            {spacingScale.map((space) => (
              <div key={space.value} className="border border-[var(--jc-gray-100)] p-6">
                <div className="grid items-center gap-6 lg:grid-cols-[150px,200px,1fr]">
                  <div>
                    <div className="mb-1 text-sm text-[var(--jc-gray-500)]">Token</div>
                    <div className="font-mono text-lg">{space.name}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-sm text-[var(--jc-gray-500)]">Valor</div>
                    <div className="font-mono">{space.value}</div>
                  </div>
                  <div>
                    <div className="h-12 bg-[var(--jc-black)]" style={{ width: space.value }} />
                  </div>
                </div>
                <div className="mt-4 border-t border-[var(--jc-gray-100)] pt-4">
                  <p className="text-sm text-[var(--jc-gray-700)]">{space.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4">Anchos de Contenedor</h2>
          <p className="mb-8 max-w-2xl text-[var(--jc-gray-700)]">
            Anchos máximos recomendados para diferentes tipos de contenido.
          </p>
          <div className="space-y-6">
            <div className="border border-[var(--jc-gray-100)] p-6">
              <div className="mb-4">
                <h4 className="mb-1">Contenedor Principal</h4>
                <p className="text-sm text-[var(--jc-gray-700)]">
                  Ancho máximo: <span className="font-mono">1280px</span>
                </p>
              </div>
              <div className="flex h-20 max-w-7xl items-center border-l-4 border-[var(--jc-black)] bg-[var(--jc-gray-50)] px-6">
                1280px
              </div>
            </div>
            <div className="border border-[var(--jc-gray-100)] p-6">
              <div className="mb-4">
                <h4 className="mb-1">Contenido de Texto</h4>
                <p className="text-sm text-[var(--jc-gray-700)]">
                  Ancho máximo: <span className="font-mono">672px</span>
                </p>
              </div>
              <div className="flex h-20 max-w-3xl items-center border-l-4 border-[var(--jc-black)] bg-[var(--jc-gray-50)] px-6">
                672px
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
