export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const limit = Math.min(
    parseInt(request.nextUrl.searchParams.get("limit") || "25", 10),
    100
  );

  const users = await prisma.user.findMany({
    orderBy: { xp: "desc" },
    take: limit,
    select: {
      id: true,
      discordId: true,
      username: true,
      avatar: true,
      xp: true,
      level: true,
      _count: { select: { completions: true } },
    },
  });

  const leaderboard = users.map((user: any, index: number) => ({
    rank: index + 1,
    ...user,
    missionsCompleted: user._count.completions,
    _count: undefined,
  }));

  return Response.json(leaderboard);
}
