export interface Author {
  name: string;
  position: string;
  avatar: string;
}

export const authors: Record<string, Author> = {
  "lux-network": {
    name: "Lux Network",
    position: "Engineering",
    avatar: "/authors/lux.svg",
  },
  "zach-kelling": {
    name: "Zach Kelling",
    position: "Co-founder & CEO",
    avatar: "/authors/lux.svg",
  },
} as const;

export type AuthorKey = keyof typeof authors;

export function getAuthor(key: AuthorKey): Author {
  return authors[key];
}

export function isValidAuthor(key: string): key is AuthorKey {
  return key in authors;
}
