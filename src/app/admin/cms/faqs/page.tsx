import React from "react";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin } from "@/server/auth/rbac";
import { redirect } from "next/navigation";
import CmsManager from "@/components/admin/CmsManager";
import { PageContainer, PageHeader } from "@/components/admin/ui";
import { HelpCircle } from "lucide-react";

export const metadata = {
  title: "FAQs & Knowledge Base | PrimeRides Admin",
};

export default async function AdminCmsFaqsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const [faqs, blogs, leadCount] = await Promise.all([
    prisma.fAQ.findMany({
      where: { deleted_at: null },
      orderBy: { sort_order: "asc" },
    }),
    prisma.blog.findMany({
      where: { deleted_at: null },
      include: { category: true },
      orderBy: { published_at: "desc" },
    }),
    prisma.contactLead.count({
      where: { deleted_at: null },
    }),
  ]);

  const sanitizedFaqs = faqs.map((f) => ({
    id: f.id,
    category: f.category,
    question: f.question,
    answer: f.answer,
    sort_order: f.sort_order,
    is_active: f.is_active,
    created_at: f.created_at.toISOString(),
  }));

  const sanitizedBlogs = blogs.map((b) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    category: { name: b.category?.name || "General" },
    author_name: b.author_name,
    read_time: b.read_time,
    published_at: b.published_at ? b.published_at.toISOString() : null,
    is_published: b.is_published,
  }));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Content"
        title="FAQs & Knowledge Base"
        description="Configure customer questions, answers, categories, and ordering for the public help center."
        icon={<HelpCircle className="w-5 h-5 text-[#5955D1]" />}
      />

      <React.Suspense fallback={<div className="p-12 text-center text-xs font-semibold text-slate-400">Loading FAQs Console...</div>}>
        <CmsManager
          initialFaqs={sanitizedFaqs}
          blogs={sanitizedBlogs}
          leadCount={leadCount}
          defaultTab="faqs"
        />
      </React.Suspense>
    </PageContainer>
  );
}
