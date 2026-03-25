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
  } catch (error) {
    console.error("OAuth callback error:", error);
    return Response.json({ error: "Authentication failed" }, { status: 500 });
  }

  redirect("/dashboard");
}
