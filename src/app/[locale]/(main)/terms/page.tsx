import { setRequestLocale } from "next-intl/server";
import { LegalArticle } from "@/components/legal/legal-article";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation | RiftForge",
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";

  return (
    <LegalArticle
      title={fr ? "Conditions d'utilisation" : "Terms of Use"}
      updated={fr ? "Dernière mise à jour : [à compléter]" : "Last updated: [to be completed]"}
    >
      {fr ? (
        <>
          <p>
            En utilisant RiftForge, vous acceptez les présentes conditions. Le
            site est fourni « tel quel », à titre informatif et communautaire.
          </p>
          <h2>Contenu des utilisateurs</h2>
          <ul>
            <li>
              Vous êtes responsable de ce que vous publiez (decks, sujets,
              réponses, commentaires), même de façon anonyme.
            </li>
            <li>
              Sont interdits : contenus illégaux, haineux, diffamatoires, spam,
              publicité non sollicitée, ou portant atteinte aux droits d’autrui.
            </li>
            <li>
              En publiant, vous accordez à RiftForge le droit d’afficher et de
              diffuser ce contenu sur le site.
            </li>
            <li>
              Nous pouvons modérer ou supprimer tout contenu, sans préavis.
            </li>
          </ul>
          <h2>Prix et liens marchands</h2>
          <p>
            Les prix affichés sont indicatifs et proviennent de sources tierces ;
            ils peuvent être inexacts ou périmés. Les liens « Acheter / Comparer »
            sont des liens d’affiliation : nous pouvons percevoir une commission.
            Toute transaction se fait sur le site marchand tiers, sous sa seule
            responsabilité.
          </p>
          <h2>Propriété intellectuelle</h2>
          <p>
            RiftForge n’est pas affilié à Riot Games. « Riftbound », « League of
            Legends » et les visuels de cartes sont la propriété de Riot Games,
            Inc. Ils sont utilisés à des fins informatives et communautaires.
          </p>
          <h2>Responsabilité</h2>
          <p>
            Le site est fourni sans garantie. Nous ne saurions être tenus
            responsables des décisions d’achat ou des contenus publiés par les
            utilisateurs.
          </p>
        </>
      ) : (
        <>
          <p>
            By using RiftForge you accept these terms. The site is provided “as
            is”, for informational and community purposes.
          </p>
          <h2>User content</h2>
          <ul>
            <li>
              You are responsible for what you post (decks, topics, replies,
              comments), even anonymously.
            </li>
            <li>
              Prohibited: illegal, hateful, defamatory content, spam, unsolicited
              advertising, or anything infringing others’ rights.
            </li>
            <li>
              By posting, you grant RiftForge the right to display and
              distribute that content on the site.
            </li>
            <li>We may moderate or remove any content, without notice.</li>
          </ul>
          <h2>Prices and merchant links</h2>
          <p>
            Displayed prices are indicative, come from third-party sources, and
            may be inaccurate or outdated. “Buy / Compare” links are affiliate
            links: we may earn a commission. Any transaction happens on the
            third-party merchant’s site, under its sole responsibility.
          </p>
          <h2>Intellectual property</h2>
          <p>
            RiftForge is not affiliated with Riot Games. “Riftbound”, “League of
            Legends” and card artwork are the property of Riot Games, Inc., used
            for informational and community purposes.
          </p>
          <h2>Liability</h2>
          <p>
            The site is provided without warranty. We are not liable for
            purchase decisions or for content posted by users.
          </p>
        </>
      )}
    </LegalArticle>
  );
}
