import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const redirectPath = searchParams.get("redirect") || "/";

  // Disable Next.js draft mode
  const draft = await draftMode();
  draft.disable();

  // Redirect back to page
  redirect(redirectPath);
}
