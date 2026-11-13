import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogs, getBlogBySlug } from "@/server/cms";
import { getFleetCars } from "@/server/fleet";
import TrustBar from "@/components/TrustBar";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  Share2,
  Bookmark,
  MapPin,
  Car,
  Compass,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export async function generateStaticParams() {
  const blogs = await getBlogs();
  return blogs.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return { title: "Blog Article - PrimeRides" };
  }

  return {
    title: `${post.title} | PrimeRides Travel Desk`,
    description:
      post.summary || `Read about ${post.title} on PrimeRides travel desk.`,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allBlogs, fleet] = await Promise.all([
    getBlogBySlug(slug),
    getBlogs(),
    getFleetCars(),
  ]);

  if (!post) {
    notFound();
  }

  // Related blogs
  const relatedBlogs = (allBlogs || [])
    .filter((b) => b?.slug && b.slug !== slug)
    .slice(0, 3);

  // Recommended car from fleet (e.g. Fortuner, Thar, or Innova) with safe empty fleet fallback
  const safeFleet = Array.isArray(fleet) ? fleet : [];
  const recommendedCar =
    safeFleet.find(
      (c) =>
        c?.slug &&
        (c.slug.includes("fortuner") ||
          c.slug.includes("thar") ||
          c.slug.includes("innova"))
    ) ||
    safeFleet[0] ||
    null;

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 pt-28 sm:pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Bar */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 pb-2 border-b border-slate-200/80">
          <Link href="/" className="hover:text-amber-700 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/blogs" className="hover:text-amber-700 transition-colors">
            Travel Guides
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
            {post.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
              {post.categoryName || "Road Trip Guide"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-heading">
            {post.title}
          </h1>

          {post.summary && (
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-4xl">
              {post.summary}
            </p>
          )}

          {/* Author & Date Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold text-sm flex items-center justify-center shadow-xs">
                {post.authorName ? post.authorName.charAt(0) : "P"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {post.authorName || "PrimeRides Travel Desk"}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.publishedAt}
                  </span>
                  <span>•</span>
                  <span>Verified Route Guide</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/cars"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Rent a Car For This Trip</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Editorial Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Main Article Body (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero Image */}
            <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-100 aspect-[16/9]">
              <img
                src={post.featuredImage || "/assets/img/blog/2.jpg"}
                alt={post.title || "PrimeRides Travel Article Featured Image"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quick Route Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Trip Duration
                </span>
                <p className="text-sm font-extrabold text-slate-900">3 Days / Weekend</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Corridor Hub
                </span>
                <p className="text-sm font-extrabold text-slate-900">Delhi NCR Starting</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Toll &amp; Fastag
                </span>
                <p className="text-sm font-extrabold text-emerald-600">Auto FASTag Active</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Best Vehicle
                </span>
                <p className="text-sm font-extrabold text-amber-700">4x4 SUV / Innova</p>
              </div>
            </div>

            {/* Main Article Body */}
            <article className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
              <div className="prose prose-slate max-w-none space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
                {(post.content || "").split("\n\n").map((block, idx) => {
                  // Heading 3
                  if (block.startsWith("### ")) {
                    return (
                      <div key={idx} className="pt-4 border-t border-slate-100 first:pt-0 first:border-none">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-2 font-heading">
                          <span className="w-1.5 h-6 rounded-full bg-amber-500 inline-block" />
                          <span>{block.replace("### ", "")}</span>
                        </h2>
                      </div>
                    );
                  }

                  // Divider
                  if (block.trim() === "---") {
                    return <hr key={idx} className="border-slate-200 my-6" />;
                  }

                  // Bullet points or list
                  if (block.startsWith("- ") || block.startsWith("1. ")) {
                    const lines = block.split("\n");
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                      >
                        {lines.map((line, lIdx) => (
                          <div key={lIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span
                              dangerouslySetInnerHTML={{
                                __html: line
                                  .replace(/^[-*]\s+|\d+\.\s+/, "")
                                  .replace(/\*\*(.*?)\*\*/g, "<strong class='text-slate-900 font-bold'>$1</strong>"),
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  }

                  // Normal Paragraph
                  return (
                    <p
                      key={idx}
                      className="leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: block.replace(
                          /\*\*(.*?)\*\*/g,
                          "<strong class='text-slate-900 font-bold'>$1</strong>"
                        ),
                      }}
                    />
                  );
                })}
              </div>
            </article>
          </div>

          {/* Sticky Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            {/* Recommended Fleet Vehicle Card */}
            {recommendedCar ? (
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                    Recommended Self-Drive Vehicle For This Route
                  </span>
                </div>
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
                  <img
                    src={recommendedCar.primary_image || "/assets/img/cars/1.jpg"}
                    alt={`${recommendedCar.name || "Recommended"} Vehicle`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 font-heading">
                    {recommendedCar.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {recommendedCar.transmission} • {recommendedCar.fuel_type} • {recommendedCar.seats} Seats
                  </p>
                  <p className="text-sm font-extrabold text-amber-700 mt-2">
                    Starting from ₹{Number(recommendedCar.price_per_day || 2500).toLocaleString("en-IN")}<span className="text-xs font-normal text-slate-400"> / 300 km</span>
                  </p>
                </div>
                <Link
                  href={recommendedCar.slug ? `/cars/${recommendedCar.slug}` : "/cars"}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs uppercase tracking-wider text-center block shadow-sm transition-all"
                >
                  Book This Car →
                </Link>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Verified Self-Drive Fleet
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">Explore All Available Vehicles</h4>
                  <p className="text-xs text-slate-500 mt-1">Explore 50+ SUVs and sedans ready for doorstep delivery.</p>
                </div>
                <Link
                  href="/cars"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs uppercase tracking-wider text-center block shadow-sm transition-all"
                >
                  View Fleet Inventory →
                </Link>
              </div>
            )}

            {/* Travel Concierge Tip Box */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Prime Concierge Tip</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Before ascending hill ghats or driving on national expressways, ensure cold tyre pressure is calibrated. All PrimeRides vehicles are thoroughly inspected, equipped with high-speed FASTag, and backed by 24/7 roadside assistance.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>24/7 Roadside Assistance</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
            </div>

            {/* Instant WhatsApp Support Card */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900">Need Route Advice?</p>
                <p className="text-[11px] text-slate-500">Talk to our fleet travel concierge.</p>
              </div>
              <a
                href="https://wa.me/919045301702?text=Hi%20PrimeRides,%20I%20am%20reading%20your%20travel%20guide%20and%20want%20to%20plan%20a%20trip."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap transition-colors"
              >
                WhatsApp Us
              </a>
            </div>
          </aside>
        </div>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <div className="pt-8 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#936e16] block">
                  Keep Exploring
                </span>
                <h3 className="text-xl font-extrabold text-[#0b0f19] font-heading">
                  More Travel Guides &amp; Itineraries
                </h3>
              </div>
              <Link
                href="/blogs"
                className="text-xs font-bold text-[#c59b27] hover:text-[#936e16] flex items-center gap-1 transition-colors"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex gap-4 items-center group"
                >
                  <img
                    src={b.featuredImage || "/assets/img/blog/1.jpg"}
                    alt={b.title || "Related Travel Guide Article"}
                    className="w-24 h-20 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#936e16] block">
                      {b.categoryName}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#0b0f19] group-hover:text-[#c59b27] transition-colors line-clamp-2 leading-snug">
                      <Link href={`/blogs/${b.slug}`} className="!text-[#0b0f19] hover:!text-[#c59b27] transition-colors">{b.title}</Link>
                    </h4>
                    <span className="text-[11px] text-slate-400 block">
                      {b.readTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-16">
        <TrustBar />
      </div>
    </div>
  );
}
