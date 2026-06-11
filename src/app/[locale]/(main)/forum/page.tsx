import { useTranslations } from "next-intl";

export default function ForumPage() {
  const t = useTranslations("forum");

  const categories = [
    {
      name: "Strategie",
      description: "Discussion autour des strategies et du metagame",
      topics: 142,
      replies: 1203,
    },
    {
      name: "Echanges",
      description: "Proposez vos echanges de cartes",
      topics: 89,
      replies: 567,
    },
    {
      name: "Tournois",
      description: "Annonces et resultats de tournois",
      topics: 34,
      replies: 298,
    },
    {
      name: "General",
      description: "Discussion libre autour de Riftbound",
      topics: 210,
      replies: 1876,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-100">{t("title")}</h1>
        <button className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500">
          {t("newTopic")}
        </button>
      </div>

      {/* Forum Categories */}
      <div className="mt-8 space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
          >
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">
                {cat.name}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">{cat.description}</p>
            </div>
            <div className="flex gap-8 text-center">
              <div>
                <div className="text-lg font-semibold text-zinc-300">
                  {cat.topics}
                </div>
                <div className="text-xs text-zinc-500">{t("topics")}</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-300">
                  {cat.replies}
                </div>
                <div className="text-xs text-zinc-500">{t("replies")}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
