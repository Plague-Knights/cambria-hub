import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
type MissionType = "CORE" | "DAILY" | "WEEKLY" | "SEASONAL" | "SPECIAL";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const active = searchParams.get("active");

  const where: Record<string, unknown> = {};

  const validTypes: MissionType[] = ["CORE", "DAILY", "WEEKLY", "SEASONAL", "SPECIAL"];
  if (type && validTypes.includes(type as MissionType)) {
    where.type = type;
  }
  if (category) {
    where.category = category;
  }
  if (active !== null && active !== undefined) {
    where.isActive = active === "true";
  }

  const missions = await prisma.mission.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      season: true,
      _count: { select: { completions: true } },
    },
  });

  return Response.json(missions);
}

export async function POST(request: NextRequest) {
  // Admin only - skipping auth for now
  const body = await request.json();

  const mission = await prisma.mission.create({
    data: {
      title: body.title,
      description: body.description,
      type: body.type || "CORE",
      category: body.category || "general",
      xpReward: body.xpReward || 100,
      icon: body.icon || null,
      requirement: body.requirement || null,
      prerequisiteId: body.prerequisiteId || null,
      seasonId: body.seasonId || null,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder || 0,
    },
  });

  return Response.json(mission, { status: 201 });
}
