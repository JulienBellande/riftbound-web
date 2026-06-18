import { setRequestLocale } from "next-intl/server";
import { LegalArticle } from "@/components/legal/legal-article";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confidentialité | RiftForge",
  robots: { index: true, follow: true },
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";

  return (
    <LegalArticle
      title={fr ? "Politique de confidentialité" : "Privacy Policy"}
      updated={fr ? "Dernière mise à jour : [à compléter]" : "Last updated: [to be completed]"}
    >
      {fr ? (
        <>
          <p>
            RiftForge est un site communautaire et informatif autour du jeu
            Riftbound. Nous avons conçu le site pour collecter le moins de
            données possible.
          </p>
          <h2>Aucun compte, aucune donnée personnelle requise</h2>
          <p>
            La navigation et la participation (forum, decks, commentaires) ne
            nécessitent pas de compte. Aucune adresse e-mail ni identité n’est
            demandée. Les contributions sont publiées sous un{" "}
            <strong>pseudonyme anonyme</strong> généré aléatoirement à partir
            d’un nom de carte. N’indiquez pas d’informations personnelles dans
            vos messages : ils sont publics.
          </p>
          <h2>Cookies</h2>
          <ul>
            <li>
              <strong>Cookie fonctionnel</strong> (« rb_voter ») : un
              identifiant anonyme servant uniquement à éviter les votes en
              double sur les decks. Aucune donnée personnelle, aucun suivi
              publicitaire.
            </li>
            <li>
              <strong>Mesure d’audience</strong> : si activée, nous utilisons
              Plausible, une solution <em>sans cookie</em> et respectueuse de la
              vie privée (statistiques agrégées, aucune donnée personnelle).
            </li>
          </ul>
          <h2>Liens d’affiliation</h2>
          <p>
            Les boutons « Acheter / Comparer » renvoient vers des marketplaces
            partenaires (CardNexus, TCGplayer, etc.). En suivant ces liens, ces
            sites tiers peuvent déposer leurs propres cookies, soumis à{" "}
            <em>leurs</em> politiques de confidentialité. Nous pouvons percevoir
            une commission sur les achats.
          </p>
          <h2>Vos droits</h2>
          <p>
            Le contenu que vous publiez étant anonyme, nous ne pouvons pas le
            relier à votre identité. Pour toute demande (suppression d’un
            message, question RGPD), contactez-nous : [adresse e-mail à
            compléter].
          </p>
          <h2>Hébergement</h2>
          <p>Site hébergé par : [hébergeur à compléter].</p>
        </>
      ) : (
        <>
          <p>
            RiftForge is a community and reference site for the Riftbound card
            game. It is designed to collect as little data as possible.
          </p>
          <h2>No account, no personal data required</h2>
          <p>
            Browsing and contributing (forum, decks, comments) require no
            account. No email or identity is requested. Contributions are
            posted under a randomly generated{" "}
            <strong>anonymous pseudonym</strong> based on a card name. Do not
            include personal information in your posts: they are public.
          </p>
          <h2>Cookies</h2>
          <ul>
            <li>
              <strong>Functional cookie</strong> (“rb_voter”): an anonymous id
              used only to prevent duplicate deck votes. No personal data, no ad
              tracking.
            </li>
            <li>
              <strong>Analytics</strong>: if enabled, we use Plausible, a{" "}
              <em>cookieless</em>, privacy-friendly tool (aggregated stats, no
              personal data).
            </li>
          </ul>
          <h2>Affiliate links</h2>
          <p>
            “Buy / Compare” buttons point to partner marketplaces (CardNexus,
            TCGplayer, etc.). Following these links, those third-party sites may
            set their own cookies under <em>their</em> privacy policies. We may
            earn a commission on purchases.
          </p>
          <h2>Your rights</h2>
          <p>
            Because your contributions are anonymous, we cannot link them to
            your identity. For any request (post removal, GDPR question) contact
            us: [email to be completed].
          </p>
          <h2>Hosting</h2>
          <p>Site hosted by: [host to be completed].</p>
        </>
      )}
    </LegalArticle>
  );
}
