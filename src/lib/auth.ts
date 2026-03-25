import { cookies } from "next/headers";
import { prisma } from "./prisma";
import crypto from "crypto";

const COOKIE_NAME = "cf_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Build Discord OAuth2 authorize URL
export function getDiscordAuthorizeUrl() {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    response_type: "code",
    scope: "identify",
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

// Exchange authorization code for access token
async function exchangeCode(code: string) {
  const res = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    }),
  });
  if (!res.ok) {
    throw new Error(`Discord token exchange failed: ${res.status}`);
  }
  return res.json() as Promise<{ access_token: string; token_type: string }>;
}

// Fetch Discord user profile
async function fetchDiscordUser(accessToken: string) {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Discord user fetch failed: ${res.status}`);
  }
  return res.json() as Promise<{
    id: string;
    username: string;
    avatar: string | null;
  }>;
}

// Handle the full OAuth callback: exchange code, fetch user, upsert, create session
export async function handleOAuthCallback(code: string) {
  const tokenData = await exchangeCode(code);
  const discordUser = await fetchDiscordUser(tokenData.access_token);

  // Upsert user
  const user = await prisma.user.upsert({
    where: { discordId: discordUser.id },
    update: {
      username: discordUser.username,
      avatar: discordUser.avatar,
    },
    create: {
      discordId: discordUser.id,
      username: discordUser.username,
      avatar: discordUser.avatar,
    },
  });

  // Create session
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    },
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return user;
}

// Get the current user from the session cookie (returns null if not authenticated)
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  const session = await prisma.session.findUnique({
    where: { token: sessionCookie.value },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}
