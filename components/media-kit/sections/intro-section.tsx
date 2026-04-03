import { BRAND } from "../assets";

export function IntroSection() {
  return (
    <section id="intro" className="flex min-h-screen items-center">
      <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="mb-8 inline-block bg-[var(--jc-gray-50)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--jc-gray-700)]">
              Manual de Marca
            </div>
            <h1 className="mb-6">
              Jean Cartier
              <br />
              Brand Guidelines
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-[var(--jc-gray-700)]">
              Manual completo de identidad visual y guías de estilo para la tienda departamental más
              emblemática de Buenos Aires.
            </p>
            <div className="mt-16 grid grid-cols-3 gap-8">
              <div>
                <div className="mb-2 text-3xl">1969</div>
                <div className="text-sm text-[var(--jc-gray-700)]">Año de fundación</div>
              </div>
              <div>
                <div className="mb-2 text-3xl">Buenos Aires</div>
                <div className="text-sm text-[var(--jc-gray-700)]">Origen</div>
              </div>
              <div>
                <div className="mb-2 text-3xl">Herencia</div>
                <div className="text-sm text-[var(--jc-gray-700)]">Tercera generación</div>
              </div>
            </div>
            <div className="mt-12 border-t border-[var(--jc-gray-100)] pt-8">
              <p className="text-sm text-[var(--jc-gray-700)]">
                Actualmente dirigida por los nietos de Jean y María Fernanda, Jean Cartier Herencia
                SRL continúa el legado de elegancia y calidad que caracterizó a la marca desde su
                fundación en 1969.
              </p>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="flex h-80 w-80 items-center justify-center bg-[var(--jc-gray-50)]">
              <img
                src={BRAND.isologoV2}
                alt="Jean Cartier Isologo"
                className="h-48 w-48 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
