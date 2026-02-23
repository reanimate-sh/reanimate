export type ChangelogSection = {
  title: string;
  items: string[];
};

export type ChangelogEntry = {
  version: string;
  title: string;
  date: string;
  sections: ChangelogSection[];
  housekeepingLabel?: string;
  housekeepingDetails?: string[];
};
