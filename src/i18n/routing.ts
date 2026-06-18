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
    "/blog": {
      fr: "/blog",
      en: "/blog",
    },
    "/blog/[slug]": {
      fr: "/blog/[slug]",
      en: "/blog/[slug]",
    },
    "/forum": {
      fr: "/forum",
      en: "/forum",
    },
    "/forum/[category]": {
      fr: "/forum/[category]",
      en: "/forum/[category]",
    },
    "/forum/[category]/[topicId]": {
      fr: "/forum/[category]/[topicId]",
      en: "/forum/[category]/[topicId]",
    },
    "/privacy": {
      fr: "/confidentialite",
      en: "/privacy",
    },
    "/terms": {
      fr: "/conditions",
      en: "/terms",
    },
    "/legal": {
      fr: "/mentions-legales",
      en: "/legal",
    },
  },
});

export type Pathnames = keyof typeof routing.pathnames;

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
