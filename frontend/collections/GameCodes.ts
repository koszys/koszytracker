import type { CollectionConfig } from "payload";

export const GameCodes: CollectionConfig = {
  slug: "game-codes",
  admin: {
    useAsTitle: "code",
    group: "Content",
  },
  access: {
    read: () => true,
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
