import type { CollectionConfig } from "payload";

export const GameCodes: CollectionConfig = {
  slug: "game-codes",
  admin: {
    useAsTitle: "code",
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
      name: "code",
      type: "text",
      required: true,
    },
    {
      name: "reward",
      type: "text",
      required: true,
    },
    {
      name: "isNew",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
