import type { CollectionConfig } from "payload";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "name",
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
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "type",
      type: "select",
      options: ["banner", "event"],
      required: true,
    },
    {
      name: "start",
      type: "date",
      required: true,
    },
    {
      name: "end",
      type: "date",
      required: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "label",
      type: "json",
    },
    {
      name: "bannerData",
      type: "json",
    },
  ],
};
