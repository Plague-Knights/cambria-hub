export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guides = await prisma.guide.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      category: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Response.json(guides);
}
