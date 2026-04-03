import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-jc-gray-50 p-8">
      <h1 className="text-title-md font-semibold text-jc-black">404</h1>
      <p className="mb-4 text-body text-jc-gray-700">Página no encontrada.</p>
      <Link href="/" className="text-jc-gold underline">
        Inicio
      </Link>
    </main>
  );
}
