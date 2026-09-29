"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBookings(status?: string) {
  return await prisma.booking.findMany({
    where: {
      deleted_at: null,
      ...(status ? { status } : {}),
    },
    include: {
      car: true,
      customer: true,
    },
    orderBy: { created_at: "desc" },
  });
}

export async function updateBookingStatus(id: number, status: string, adminNotes?: string) {
  try {
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(adminNotes ? { admin_notes: adminNotes } : {}),
      },
    });
    revalidatePath("/admin/bookings");
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getContactLeads(status?: string) {
  return await prisma.contactLead.findMany({
    where: {
      deleted_at: null,
      ...(status ? { status } : {}),
    },
    orderBy: { created_at: "desc" },
  });
}
