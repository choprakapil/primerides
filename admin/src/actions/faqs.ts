"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFAQs() {
  return await prisma.fAQ.findMany({
    where: { deleted_at: null },
    orderBy: { sort_order: "asc" },
  });
}

export async function createFAQ(data: { category: string; question: string; answer: string; sort_order?: number }) {
  try {
    const faq = await prisma.fAQ.create({ data });
    revalidatePath("/admin/faqs");
    revalidatePath("/faq");
    return { success: true, data: faq };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteFAQ(id: number) {
  try {
    await prisma.fAQ.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    revalidatePath("/admin/faqs");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
