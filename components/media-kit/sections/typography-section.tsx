import { InterExamples } from "../inter-examples";

const typeScale = [
  { name: "Display Large", size: "48px", weight: "300", usage: "Títulos principales, héroes" },
  { name: "Display Medium", size: "36px", weight: "300", usage: "Títulos de sección" },
  { name: "Heading Large", size: "28px", weight: "400", usage: "Subtítulos importantes" },
  { name: "Heading Small", size: "20px", weight: "500", usage: "Títulos de componentes" },
  { name: "Body Large", size: "18px", weight: "400", usage: "Texto destacado" },
  { name: "Body", size: "16px", weight: "400", usage: "Texto principal" },
  { name: "Caption", size: "14px", weight: "400", usage: "Textos secundarios" },
  { name: "Label", size: "14px", weight: "500", usage: "Etiquetas y botones" },
];

const weights = [
  { name: "Extra Light", value: "200", usage: "Decorativo, uso limitado" },
  { name: "Light", value: "300", usage: "Títulos grandes" },
  { name: "Regular", value: "400", usage: "Cuerpo de texto" },
  { name: "Medium", value: "500", usage: "Énfasis sutil" },
  { name: "Semi Bold", value: "600", usage: "Subtítulos importantes" },
  { name: "Bold", value: "700", usage: "Llamadas a la acción" },
  { name: "Extra Bold", value: "800", usage: "Uso excepcional" },
];

export function TypographySection() {
  return (
    <section id="typography" className="bg-[var(--jc-gray-50)] py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="mb-4">Tipografía</h1>
          <p className="max-w-3xl text-xl text-[var(--jc-gray-700)]">
            Fustat es nuestra familia tipográfica principal. Una fuente geométrica y versátil que
            equilibra modernidad con elegancia.
          </p>
        </div>

        <div className="mb-20">
          <h2 className="mb-8">Familias Tipográficas</h2>
          <div className="mb-8 border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-12">
            <div className="text-center">
              <div className="mb-4 text-6xl lg:text-8xl" style={{ fontWeight: 300 }}>
                Fustat
              </div>
              <div className="text-sm uppercase tracking-widest text-[var(--jc-gray-700)]">
                Familia Principal
              </div>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--jc-gray-700)]">
                Títulos, encabezados, contenido editorial y elementos de marca principales
              </p>
            </div>
          </div>

          <div className="mb-8 border border-[var(--jc-gray-900)] bg-[var(--jc-black)] p-16">
            <div className="text-center">
              <div
                className="mb-6 font-inter text-5xl font-medium uppercase text-[var(--jc-white)] lg:text-7xl"
                style={{ letterSpacing: "0.15em" }}
              >
                INTER
              </div>
              <div className="font-inter text-sm uppercase tracking-[0.3em] text-[var(--jc-gray-300)]">
                Familia Secundaria
              </div>
              <p className="mx-auto mt-6 max-w-2xl font-inter text-sm text-[var(--jc-gray-300)]">
                Etiquetas, navegación, UI, textos cortos en mayúsculas con amplio espaciado
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="border border-[var(--jc-gray-100)] p-6">
              <h4 className="mb-4">Fustat - Características</h4>
              <ul className="space-y-2 text-[var(--jc-gray-700)]">
                <li>• Geométrica y moderna</li>
                <li>• Excelente legibilidad en párrafos</li>
                <li>• Amplio rango de pesos (200-800)</li>
                <li>• Ideal para títulos y cuerpo de texto</li>
              </ul>
            </div>
            <div className="border border-[var(--jc-gray-100)] p-6">
              <h4 className="mb-4">Inter - Características</h4>
              <ul className="space-y-2 text-[var(--jc-gray-700)]">
                <li>• Diseñada para interfaces digitales</li>
                <li>• Perfecta para texto pequeño</li>
                <li>• Excelente en mayúsculas espaciadas</li>
                <li>• Ideal para navegación y labels</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="mb-4">Escala Tipográfica</h2>
          <p className="mb-8 max-w-2xl text-[var(--jc-gray-700)]">
            Sistema jerárquico de tamaños y pesos para crear composiciones claras.
          </p>
          <div className="space-y-6">
            {typeScale.map((type, index) => (
              <div
                key={type.name}
                className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-6"
              >
                <div className="grid items-end gap-6 lg:grid-cols-[1fr,200px]">
                  <div>
                    <div
                      className="mb-4"
                      style={{
                        fontSize: type.size,
                        fontWeight: type.weight,
                        lineHeight: index < 4 ? "1.2" : "1.6",
                      }}
                    >
                      Jean Cartier
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-[var(--jc-gray-500)]">Nombre:</span> {type.name}
                    </div>
                    <div>
                      <span className="text-[var(--jc-gray-500)]">Tamaño:</span> {type.size}
                    </div>
                    <div>
                      <span className="text-[var(--jc-gray-500)]">Peso:</span> {type.weight}
                    </div>
                    <div>
                      <span className="text-[var(--jc-gray-500)]">Uso:</span> {type.usage}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="mb-4">Pesos Disponibles</h2>
          <p className="mb-8 max-w-2xl text-[var(--jc-gray-700)]">
            Fustat ofrece 7 pesos diferentes para crear la jerarquía perfecta.
          </p>
          <div className="space-y-4">
            {weights.map((weight) => (
              <div
                key={weight.value}
                className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-6"
              >
                <div className="grid items-center gap-6 md:grid-cols-[200px,1fr,1fr]">
                  <div>
                    <div className="mb-1 text-sm text-[var(--jc-gray-500)]">{weight.name}</div>
                    <div className="font-mono text-sm">{weight.value}</div>
                  </div>
                  <div className="text-3xl" style={{ fontWeight: Number(weight.value) }}>
                    Buenos Aires
                  </div>
                  <div className="text-sm text-[var(--jc-gray-700)]">{weight.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-8">Caracteres</h2>
          <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-12">
            <div className="space-y-8 text-center">
              <div>
                <div className="mb-4 text-xs uppercase tracking-widest text-[var(--jc-gray-500)]">
                  Mayúsculas
                </div>
                <div className="text-3xl tracking-wide">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
              </div>
              <div>
                <div className="mb-4 text-xs uppercase tracking-widest text-[var(--jc-gray-500)]">
                  Minúsculas
                </div>
                <div className="text-3xl">abcdefghijklmnopqrstuvwxyz</div>
              </div>
              <div>
                <div className="mb-4 text-xs uppercase tracking-widest text-[var(--jc-gray-500)]">
                  Números
                </div>
                <div className="text-3xl">0123456789</div>
              </div>
            </div>
          </div>
        </div>

        <InterExamples />
      </div>
    </section>
  );
}
