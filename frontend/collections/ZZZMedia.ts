import type { CollectionConfig } from "payload";
import { prependCategoryToFilename } from "./hooks/prependCategoryToFilename";

export const ZZZMedia: CollectionConfig = {
  slug: "zzz-media",
  admin: {
    group: "Media",
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "category",
      type: "select",
      defaultValue: "characters",
      options: [
        { label: "Characters", value: "characters" },
        { label: "Events", value: "events" },
        { label: "Banners", value: "banners" },
        { label: "Weapons", value: "weapons" },
      ],
    },
  ],
  upload: {
    adminThumbnail: ({ doc }) => doc.url as string,
  },
  hooks: {
    beforeChange: [prependCategoryToFilename],
  },
  folders: true,
};
