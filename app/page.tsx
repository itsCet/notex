export default function Home() {
  const pillars = [
    {
      title: "IA native",
      desc: "Des blocs générés, résumés et complétés par IA directement dans l'éditeur — pas un plugin greffé après coup.",
    },
    {
      title: "Rapide comme un éditeur local",
      desc: "Frappe instantanée, offline-first, synchronisation en arrière-plan. Zéro lag, même avec des milliers de pages.",
    },
    {
      title: "Collaboration temps réel",
      desc: "Curseurs live, commentaires, permissions fines — la fluidité d'un éditeur collaboratif moderne.",
    },
    {
      title: "Bases de données avancées",
      desc: "Relations, formules, automatisations et vues personnalisées qui vont plus loin que les databases classiques.",
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
            Un espace de travail qui pense avec toi.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Notex reprend l&apos;idée des blocs et des pages de Notion, et la
            pousse plus loin : IA native, vitesse d&apos;un éditeur local,
            collaboration en temps réel et bases de données puissantes.
          </p>
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

        <footer className="text-sm text-zinc-500">
          En construction — v0.1.
        </footer>
      </main>
    </div>
  );
}
