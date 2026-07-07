import Navbar from "@/app/Layout/Navbar/Navbar";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-[#F7F8F7]">
      <Navbar activeItem="Rutas" />

      <section className="flex flex-1 flex-col justify-center px-10 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-700">
          Accion Territorial
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
          Bienvenido al sistema de gestion territorial.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Base inicial del proyecto lista para construir modulos de rutas,
          eventos, articulos, usuarios y reportes.
        </p>
      </section>
    </main>
  );
}
