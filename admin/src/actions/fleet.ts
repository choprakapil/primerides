"use server";

import prisma from "../lib/prisma";
import { slugify } from "../lib/utils";
import { revalidatePath } from "next/cache";

export async function getCars(options?: { categoryId?: number; featuredOnly?: boolean }) {
  return await prisma.car.findMany({
    where: {
      deleted_at: null,
      ...(options?.categoryId ? { category_id: options.categoryId } : {}),
      ...(options?.featuredOnly ? { is_featured: true } : {}),
    },
    include: {
      category: true,
    },
    orderBy: { sort_order: "asc" },
  });
}

export async function getCarById(id: number) {
  return await prisma.car.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function createCar(data: any) {
  try {
    const slug = slugify(data.name);
    const car = await prisma.car.create({
      data: {
        ...data,
        slug,
      },
    });
    revalidatePath("/admin/cars");
    revalidatePath("/cars");
    return { success: true, data: car };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateCar(id: number, data: any) {
  try {
    const car = await prisma.car.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/cars");
    revalidatePath(`/cars/${car.slug}`);
    return { success: true, data: car };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCar(id: number) {
  try {
    await prisma.car.update({
      where: { id },
      data: { deleted_at: new Date() }, // Soft delete
    });
    revalidatePath("/admin/cars");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
