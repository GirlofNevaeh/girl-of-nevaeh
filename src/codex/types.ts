export type CodexTab = "worlds" | "characters" | "artefacts" | "timeline" | "themes" | "search";

export type CodexKind = "world" | "character" | "artefact" | "theme";

export type CharacterGroup = "family" | "nevaeh" | "shadow" | "crew" | "earth";

export interface CodexLink {
  id: string;
  label: string;
}

export interface CodexEntry {
  id: string;
  kind: CodexKind;
  name: string;
  epithet: string;
  art: string;
  extraArt?: string;
  summary: string;
  body: string;
  links: CodexLink[];
  loveLine?: string;
  relations?: string;
  group?: CharacterGroup;
}

export interface TimelineBeat {
  id: string;
  n: number;
  title: string;
  text: string;
  linkId?: string;
}

export type OrbKind = "selfless" | "selfish" | "unclear";

export interface OrbReading {
  kind: OrbKind;
  reply: string;
}
