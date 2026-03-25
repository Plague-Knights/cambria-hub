import { getDiscordAuthorizeUrl } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function GET() {
  const url = getDiscordAuthorizeUrl();
  redirect(url);
}
