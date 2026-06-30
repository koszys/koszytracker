import type { CollectionBeforeChangeHook } from "payload";

export const prependCategoryToFilename: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation !== "create") return data;

  const category = data.category as string | undefined;
  if (!category) return data;

  data.prefix = category;

  return data;
};
