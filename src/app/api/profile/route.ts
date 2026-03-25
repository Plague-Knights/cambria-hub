export const dynamic = "force-dynamic";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [completionsCount, recentCompletions] = await Promise.all([
    prisma.missionCompletion.count({
      where: { userId: user.id },
    }),
    prisma.missionCompletion.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: { mission: { select: { title: true, xpReward: true, type: true, icon: true } } },
    }),
  ]);

  return Response.json({
    id: user.id,
    discordId: user.discordId,
    username: user.username,
    avatar: user.avatar,
    xp: user.xp,
    level: user.level,
    missionsCompleted: completionsCount,
    recentCompletions,
  });
}
