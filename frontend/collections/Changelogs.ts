import type { CollectionConfig } from "payload";

export const Changelogs: CollectionConfig = {
  slug: "changelogs",
  admin: {
    useAsTitle: "title",
    group: "Content",
    preview: (doc) => {
      const gameId = doc.gameId;
      if (!gameId) return null;
      const previewSecret = process.env.PAYLOAD_SECRET || "";
      return `/api/preview?slug=${gameId}&previewSecret=${previewSecret}`;
    },
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === "admin") {
        return true;
      }
      return {
        _status: {
          equals: "published",
        },
      };
    },
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "gameId",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "content",
      type: "richText",
    },
    {
      name: "date",
      type: "date",
      required: true,
    },
  ],
};
