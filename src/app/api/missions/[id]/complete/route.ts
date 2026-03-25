import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: missionId } = await params;

  // Check mission exists and is active
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
  });

  if (!mission) {
    return Response.json({ error: "Mission not found" }, { status: 404 });
  }

  if (!mission.isActive) {
    return Response.json({ error: "Mission is not active" }, { status: 400 });
  }

  // Check if already completed
  const existing = await prisma.missionCompletion.findUnique({
    where: {
      userId_missionId: {
        userId: user.id,
        missionId,
      },
    },
  });

  if (existing) {
    return Response.json(
      { error: "Mission already completed" },
      { status: 409 }
    );
  }

  // Check prerequisite
  if (mission.prerequisiteId) {
    const prereqDone = await prisma.missionCompletion.findUnique({
      where: {
        userId_missionId: {
          userId: user.id,
          missionId: mission.prerequisiteId,
        },
      },
    });
    if (!prereqDone) {
      return Response.json(
        { error: "Prerequisite mission not completed" },
        { status: 400 }
      );
    }
  }

  // Parse optional proof from body
  let proof = null;
  try {
    const body = await request.json();
    proof = body.proof || null;
  } catch {
    // No body is fine
  }

  // Create completion and award XP in a transaction
  const [completion] = await prisma.$transaction([
    prisma.missionCompletion.create({
      data: {
        userId: user.id,
        missionId,
        proof,
      },
      include: { mission: true },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: mission.xpReward },
        level: Math.floor((user.xp + mission.xpReward) / 1000) + 1,
      },
    }),
  ]);

  return Response.json({
    completion,
    xpAwarded: mission.xpReward,
    newXp: user.xp + mission.xpReward,
    newLevel: Math.floor((user.xp + mission.xpReward) / 1000) + 1,
  });
}
