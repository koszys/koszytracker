import type { CollectionConfig } from "payload";

export const Changelogs: CollectionConfig = {
  slug: "changelogs",
  admin: {
    useAsTitle: "title",
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
