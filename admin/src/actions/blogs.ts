"use server";

import prisma from "../lib/prisma";
import { slugify } from "../lib/utils";
import { revalidatePath } from "next/cache";

export async function getBlogs() {
  return await prisma.blog.findMany({
    where: { deleted_at: null },
    include: { category: true },
    orderBy: { created_at: "desc" },
  });
}

export async function createBlog(data: any) {
  try {
    const slug = slugify(data.title);
    const blog = await prisma.blog.create({
      data: {
        ...data,
        slug,
      },
    });
    revalidatePath("/admin/blogs");
    revalidatePath("/blogs");
    return { success: true, data: blog };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteBlog(id: number) {
  try {
    await prisma.blog.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    revalidatePath("/admin/blogs");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
