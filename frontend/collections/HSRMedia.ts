import type { CollectionConfig } from "payload";

export const HSRMedia: CollectionConfig = {
  slug: "hsr-media",
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
  ],
  upload: true,
};
