import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import type { PayloadRequest } from "payload";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const previewSecret = searchParams.get("previewSecret");

  // Validate the secret
  const expectedSecret = process.env.PAYLOAD_SECRET || "";
  if (!previewSecret || previewSecret !== expectedSecret) {
    return new Response("Invalid preview secret", { status: 403 });
  }

  if (!slug) {
    return new Response("Missing game slug", { status: 400 });
  }

  // Verify that the user is authenticated as an admin in Payload CMS
  const payload = await getPayload({ config: configPromise });
  let user = null;
  try {
    user = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    });
  } catch (error) {
    payload.logger.error({ err: error }, "Error verifying token for preview");
    return new Response("Failed to verify user", { status: 403 });
  }

  if (!user || user.role !== "admin") {
    return new Response("Unauthorized for preview", { status: 403 });
  }

  // Enable Next.js draft mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the game page (e.g. /genshin)
  redirect(`/${slug}`);
}
