import Link from "next/link";

export default function Home() {
  const pillars = [
    {
      title: "Une interface épurée",
      desc: "Une seule chose à l'écran à la fois : le contenu. Pas de barres latérales encombrées, pas d'options superflues qui distraient de l'écriture.",
    },
    {
      title: "Instantané, sans exception",
      desc: "Chaque frappe, chaque ouverture de page, chaque recherche répond immédiatement — même avec des milliers de pages et de grosses bases de données.",
    },
    {
      title: "Collaboration fluide",
      desc: "Édition à plusieurs sans latence ni conflit, avec des permissions claires et faciles à gérer.",
    },
    {
      title: "Bases de données robustes",
      desc: "Relations, formules et vues qui restent rapides et lisibles même à grande échelle, sans configuration alambiquée.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex max-w-4xl flex-col gap-16 px-6 py-24 sm:px-10">
        <header className="flex flex-col gap-4">
          <span className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            Notex
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
            Toute la puissance de Notion, sans son poids.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Notex reprend les pages et les blocs de Notion et corrige ce qui
            gêne au quotidien : une interface trop chargée et des
            ralentissements dès que le contenu grossit.
          </p>
          <div>
            <Link
              href="/workspace"
              className="inline-flex items-center rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Ouvrir l&apos;espace de travail
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.1] dark:bg-zinc-950"
            >
              <h2 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">
                {p.title}
              </h2>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {p.desc}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
