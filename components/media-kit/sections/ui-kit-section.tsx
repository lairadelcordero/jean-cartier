import { ChevronRight, Heart, Search } from "lucide-react";

export function UiKitSection() {
  return (
    <section id="components" className="bg-[var(--jc-gray-50)] py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="mb-4">Componentes UI</h1>
          <p className="max-w-3xl text-xl text-[var(--jc-gray-700)]">
            Biblioteca de componentes que conforman la experiencia Jean Cartier.
          </p>
        </div>

        <div className="mb-20">
          <h2 className="mb-8">Botones</h2>
          <div className="space-y-8">
            <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-8">
              <h4 className="mb-4">Botón Principal</h4>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  className="bg-[var(--jc-black)] px-6 py-3 text-[var(--jc-white)] transition-colors hover:bg-[var(--jc-gray-900)]"
                >
                  Comprar Ahora
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-[var(--jc-black)] px-6 py-3 text-[var(--jc-white)] transition-colors hover:bg-[var(--jc-gray-900)]"
                >
                  Ver Catálogo
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-8">
              <h4 className="mb-4">Botón Secundario</h4>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  className="border border-[var(--jc-gray-300)] px-6 py-3 text-[var(--jc-black)] transition-colors hover:bg-[var(--jc-gray-50)]"
                >
                  Ver Más
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 border border-[var(--jc-gray-300)] px-6 py-3 text-[var(--jc-black)] transition-colors hover:bg-[var(--jc-gray-50)]"
                >
                  Guardar
                  <Heart size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="mb-8">Campos de Entrada</h2>
          <div className="max-w-xl space-y-6">
            <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-8">
              <label htmlFor="mk-name" className="mb-2 block text-sm">
                Nombre completo
              </label>
              <input
                id="mk-name"
                type="text"
                placeholder="Ingresa tu nombre"
                className="w-full border border-[var(--jc-gray-300)] px-4 py-3 transition-colors focus:border-[var(--jc-black)] focus:outline-none"
              />
            </div>
            <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-8">
              <label htmlFor="mk-search" className="mb-2 block text-sm">
                Buscar productos
              </label>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--jc-gray-500)]"
                  size={20}
                />
                <input
                  id="mk-search"
                  type="search"
                  placeholder="¿Qué estás buscando?"
                  className="w-full border border-[var(--jc-gray-300)] py-3 pl-12 pr-4 transition-colors focus:border-[var(--jc-black)] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-8">Badges y Tags</h2>
          <div className="border border-[var(--jc-gray-100)] bg-[var(--jc-white)] p-8">
            <div className="flex flex-wrap gap-4">
              <span className="bg-[var(--jc-black)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--jc-white)]">
                Nuevo
              </span>
              <span className="bg-[var(--jc-gold)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--jc-white)]">
                Premium
              </span>
              <span className="bg-[var(--jc-gray-100)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--jc-black)]">
                Agotado
              </span>
              <span className="border border-[var(--jc-gray-300)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--jc-black)]">
                -50% OFF
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
