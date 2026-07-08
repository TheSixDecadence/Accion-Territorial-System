export default function Home() {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-[#2E3180]">
        Accion Territorial
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-[#111A16] md:text-6xl">
        Bienvenido al sistema de gestion territorial.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
        Base inicial del proyecto lista para construir modulos de rutas,
        eventos, articulos, usuarios y reportes.
      </p>
    </div>
  );
}
