import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { GameCodes } from "./collections/GameCodes";
import { Games } from "./collections/Games";
import { Changelogs } from "./collections/Changelogs";
import { Events } from "./collections/Events";
import { GenshinMedia } from "./collections/GenshinMedia";
import { WuwaMedia } from "./collections/WuwaMedia";
import { HSRMedia } from "./collections/HSRMedia";
import { ZZZMedia } from "./collections/ZZZMedia";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const r2GenerateFileURL = ({ filename, prefix }: { filename: string; prefix?: string | null }) => {
  const key = prefix ? `${prefix}/${filename}` : filename;
  return `${process.env.R2_PUBLIC_URL}/${key}`;
};

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Games, GameCodes, Events, Changelogs, GenshinMedia, WuwaMedia, HSRMedia, ZZZMedia],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
    schemaName: "payload",
  }),
  sharp,
  plugins: [
    s3Storage({
      enabled: Boolean(process.env.R2_BUCKET),
      collections: {
        media: {
          disablePayloadAccessControl: true,
          prefix: "general",
          generateFileURL: r2GenerateFileURL,
        },
        "genshin-media": {
          disablePayloadAccessControl: true,
          prefix: "genshin",
          generateFileURL: r2GenerateFileURL,
        },
        "wuwa-media": {
          disablePayloadAccessControl: true,
          prefix: "wuwa",
          generateFileURL: r2GenerateFileURL,
        },
        "hsr-media": {
          disablePayloadAccessControl: true,
          prefix: "hsr",
          generateFileURL: r2GenerateFileURL,
        },
        "zzz-media": {
          disablePayloadAccessControl: true,
          prefix: "zzz",
          generateFileURL: r2GenerateFileURL,
        },
      },
      bucket: process.env.R2_BUCKET || "",
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
        region: "auto",
        endpoint: process.env.R2_ENDPOINT,
        forcePathStyle: true,
      },
    }),
  ],
});
