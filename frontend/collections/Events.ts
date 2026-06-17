import type { CollectionConfig } from "payload";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "name",
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
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
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
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "end",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: ["genshin-media", "wuwa-media", "hsr-media", "zzz-media"],
    },
    {
      name: "label",
      type: "text",
    },
    {
      name: "tags",
      type: "text",
    },
    {
      name: "bannerData",
      type: "json",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "banner",
      },
    },
  ],
};
