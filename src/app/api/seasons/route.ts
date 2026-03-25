import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const seasons = await prisma.season.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      _count: { select: { missions: true } },
    },
  });

  return Response.json(seasons);
}

export async function POST(request: NextRequest) {
  // Admin only - skipping auth for now
  const body = await request.json();

  const season = await prisma.season.create({
    data: {
      name: body.name,
      description: body.description || null,
      startsAt: new Date(body.startsAt),
      endsAt: new Date(body.endsAt),
      isActive: body.isActive ?? false,
    },
  });

  return Response.json(season, { status: 201 });
}
