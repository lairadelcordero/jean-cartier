export function InterExamples() {
  return (
    <div className="mt-20">
      <h2 className="mb-8">Uso de Inter en Mayúsculas</h2>
      <p className="mb-8 max-w-2xl text-[var(--jc-gray-700)]">
        Inter se utiliza principalmente en mayúsculas con amplio espaciado para etiquetas,
        navegación y elementos de interfaz.
      </p>

      <div className="space-y-6">
        <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-12">
          <div className="mb-6 text-center">
            <div
              className="mb-4 font-inter text-5xl font-medium"
              style={{ letterSpacing: "0.2em" }}
            >
              NUEVA COLECCIÓN
            </div>
            <p className="text-sm text-[var(--jc-gray-500)]">Letter-spacing: 0.2em · Weight: 500</p>
          </div>
        </div>

        <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-gray-50)] p-8">
          <div className="flex justify-center gap-12">
            {["MUJER", "HOMBRE", "ACCESORIOS", "SALE"].map((item) => (
              <div
                key={item}
                className="font-inter text-sm font-medium"
                style={{ letterSpacing: "0.15em" }}
              >
                {item}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-[var(--jc-gray-500)]">Navegación principal</p>
        </div>

        <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-8">
          <div className="flex flex-wrap justify-center gap-4">
            <span
              className="bg-[var(--jc-black)] px-6 py-3 font-inter text-[11px] font-semibold text-[var(--jc-white)]"
              style={{ letterSpacing: "0.2em" }}
            >
              NUEVO
            </span>
            <span
              className="border border-[var(--jc-gray-300)] px-6 py-3 font-inter text-[11px] font-semibold"
              style={{ letterSpacing: "0.2em" }}
            >
              AGOTADO
            </span>
            <span
              className="bg-[var(--jc-gold)] px-6 py-3 font-inter text-[11px] font-semibold text-[var(--jc-white)]"
              style={{ letterSpacing: "0.2em" }}
            >
              PREMIUM
            </span>
          </div>
          <p className="mt-6 text-center text-xs text-[var(--jc-gray-500)]">Badges y etiquetas</p>
        </div>

        <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-16">
          <div className="mx-auto max-w-2xl space-y-16 text-center">
            <div>
              <div
                className="mb-8 font-inter text-xs font-medium"
                style={{ letterSpacing: "0.3em" }}
              >
                PRIMAVERA VERANO 2026
              </div>
              <h2 className="mb-6 text-5xl" style={{ fontWeight: 300 }}>
                Colección Cápsula
              </h2>
              <div className="font-inter text-xs font-medium" style={{ letterSpacing: "0.25em" }}>
                DISPONIBLE AHORA
              </div>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-[var(--jc-gray-500)]">
            Layout editorial - Inter como complemento
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-gray-50)] p-6">
          <h4 className="mb-4">Cuándo usar Inter</h4>
          <ul className="space-y-2 text-sm text-[var(--jc-gray-700)]">
            <li>• Navegación y menús</li>
            <li>• Etiquetas y badges</li>
            <li>• Botones de interfaz</li>
            <li>• Categorías y tags</li>
            <li>• Texto corto en mayúsculas</li>
          </ul>
        </div>
        <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-gray-50)] p-6">
          <h4 className="mb-4">Reglas de espaciado</h4>
          <ul className="space-y-2 text-sm text-[var(--jc-gray-700)]">
            <li>• Letter-spacing: 0.15em - 0.3em</li>
            <li>• Peso recomendado: 500-600</li>
            <li>• Siempre en mayúsculas</li>
            <li>• Tamaño pequeño (10px-14px)</li>
            <li>• Amplio espacio alrededor</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
