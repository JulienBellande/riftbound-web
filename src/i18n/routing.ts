import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  pathnames: {
    "/": "/",
    "/cards": {
      fr: "/cartes",
      en: "/cards",
    },
    "/cards/[id]": {
      fr: "/cartes/[id]",
      en: "/cards/[id]",
    },
    "/decks": {
      fr: "/decks",
      en: "/decks",
    },
    "/decks/[id]": {
      fr: "/decks/[id]",
      en: "/decks/[id]",
    },
    "/deck-builder": {
      fr: "/constructeur-de-deck",
      en: "/deck-builder",
    },
    "/prices": {
      fr: "/prix",
      en: "/prices",
    },
    "/shop": {
      fr: "/boutique",
      en: "/shop",
    },
    "/blog": {
      fr: "/blog",
      en: "/blog",
    },
    "/forum": {
      fr: "/forum",
      en: "/forum",
    },
  },
});

export type Pathnames = keyof typeof routing.pathnames;

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
