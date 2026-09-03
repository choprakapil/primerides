"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPageMetas() {
  return await prisma.pageMeta.findMany({
    orderBy: { route_path: "asc" },
  });
}

export async function updatePageMeta(routePath: string, data: any) {
  try {
    const meta = await prisma.pageMeta.upsert({
      where: { route_path: routePath },
      update: data,
      create: { route_path: routePath, ...data },
    });
    revalidatePath(routePath);
    revalidatePath("/admin/seo");
    return { success: true, data: meta };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
