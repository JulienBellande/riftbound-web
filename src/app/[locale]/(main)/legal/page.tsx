import { setRequestLocale } from "next-intl/server";
import { LegalArticle } from "@/components/legal/legal-article";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | RiftForge",
};

export default async function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fr = locale === "fr";

  return (
    <LegalArticle title={fr ? "Mentions légales" : "Legal Notice"}>
      {fr ? (
        <>
          <h2>Éditeur du site</h2>
          <p>
            [Nom / raison sociale à compléter] — [statut, ex. entrepreneur
            individuel / SAS]. Contact : [adresse e-mail à compléter].
            [SIREN/SIRET le cas échéant].
          </p>
          <h2>Directeur de la publication</h2>
          <p>[Nom du responsable de la publication à compléter].</p>
          <h2>Hébergement</h2>
          <p>
            [Nom de l’hébergeur à compléter] — [adresse / site de l’hébergeur].
          </p>
          <h2>Propriété intellectuelle</h2>
          <p>
            RiftForge n’est pas affilié à Riot Games. « Riftbound », « League of
            Legends » et les visuels des cartes sont la propriété de Riot Games,
            Inc. Le reste du contenu éditorial du site est protégé.
          </p>
          <h2>Contact</h2>
          <p>Pour toute question : [adresse e-mail à compléter].</p>
        </>
      ) : (
        <>
          <h2>Site publisher</h2>
          <p>
            [Name / company to be completed] — [status]. Contact: [email to be
            completed]. [Company registration number if applicable].
          </p>
          <h2>Publication director</h2>
          <p>[Name of the publication director to be completed].</p>
          <h2>Hosting</h2>
          <p>[Host name to be completed] — [host address / website].</p>
          <h2>Intellectual property</h2>
          <p>
            RiftForge is not affiliated with Riot Games. “Riftbound”, “League of
            Legends” and card artwork are the property of Riot Games, Inc. The
            site’s own editorial content is otherwise protected.
          </p>
          <h2>Contact</h2>
          <p>For any question: [email to be completed].</p>
        </>
      )}
    </LegalArticle>
  );
}
