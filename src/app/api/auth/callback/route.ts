import { handleOAuthCallback } from "@/lib/auth";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return Response.json({ error: "Missing code parameter" }, { status: 400 });
  }

  try {
    await handleOAuthCallback(code);
  } catch (error: any) {
    console.error("OAuth callback error:", error?.message || error);
    return Response.json({ error: "Authentication failed", detail: error?.message?.slice(0, 200) }, { status: 500 });
  }

  redirect("/dashboard");
}
