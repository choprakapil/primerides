"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { BlogItemDTO } from "@/server/cms";
import {
  Compass,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface BlogsCatalogProps {
  initialBlogs: BlogItemDTO[];
}

const ITEMS_PER_PAGE = 8; // 2 rows of 4 = 8 per page (or 16 for 4 rows of 4)

export default function BlogsCatalog({ initialBlogs }: BlogsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12); // Default 3 rows of 4 or 4 rows of 4

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialBlogs.forEach((b) => {
      if (b.categoryName) set.add(b.categoryName);
    });
    return ["all", ...Array.from(set)];
  }, [initialBlogs]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return initialBlogs.filter((blog) => {
      const matchesCategory =
        selectedCategory === "all" ||
        blog.categoryName.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        searchQuery.trim() === "" ||
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.authorName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [initialBlogs, selectedCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedBlogs = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredBlogs.slice(start, start + itemsPerPage);
  }, [filteredBlogs, safePage, itemsPerPage]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      {/* Editorial Header Bar */}
      <div className="mb-10 pb-6 border-b border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#fffdf7] text-[#936e16] border border-[#e5b94f]/50 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>PrimeRides Travel Desk • Road Trip Guides</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b0f19] tracking-tight font-heading leading-tight">
              Road Trip Journal &amp; <span className="text-[#c59b27]">Expeditions</span>
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl font-sans leading-relaxed">
              Curated highway itineraries, high-altitude mountain pass guides, 4x4 expedition tips, and fleet advice for self-drive enthusiasts.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search guides, routes, cars..."
              className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 focus:border-[#c59b27] focus:outline-none transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const label = cat === "all" ? "All Articles" : cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-[#0b0f19] text-[#c59b27] border-[#0b0f19] shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#c59b27]/60 hover:text-[#0b0f19]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-xs font-semibold text-slate-500">
          Showing <span className="text-[#0b0f19] font-bold">{paginatedBlogs.length}</span> of{" "}
          <span className="text-[#0b0f19] font-bold">{filteredBlogs.length}</span> travel guides
        </p>

        {/* Rows per page selector */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Show:</span>
          {[8, 12, 16].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => {
                setItemsPerPage(count);
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${
                itemsPerPage === count
                  ? "bg-[#0b0f19] text-[#c59b27]"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Columns Grid (4 blogs per row on desktop) */}
      {paginatedBlogs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Compass className="w-12 h-12 text-[#c59b27] mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-[#0b0f19] font-heading">No Travel Guides Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or select another category to view more articles.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-[#0b0f19] text-[#c59b27] text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedBlogs.map((blog) => (
            <article
              key={blog.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:border-[#c59b27]/60 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Image Preview */}
              <Link
                href={`/blogs/${blog.slug}`}
                className="relative aspect-[16/10] overflow-hidden bg-slate-900 block"
              >
                <img
                  src={blog.featuredImage || "/assets/img/blog/1.jpg"}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0b0f19]/85 text-[#f7d58b] backdrop-blur-md shadow-xs border border-[#c59b27]/30">
                    {blog.categoryName}
                  </span>
                </div>
              </Link>

              {/* Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#c59b27]" />
                      {blog.publishedAt}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#c59b27]" />
                      {blog.readTime}
                    </span>
                  </div>

                  <Link href={`/blogs/${blog.slug}`}>
                    <h3 className="text-base font-bold text-[#0b0f19] group-hover:text-[#c59b27] transition-colors line-clamp-2 leading-snug font-heading">
                      {blog.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-2 font-sans leading-relaxed">
                    {blog.summary}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[120px]">
                    {blog.authorName}
                  </span>
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="text-xs font-bold text-[#c59b27] group-hover:text-[#936e16] flex items-center gap-1 transition-colors"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-slate-500">
            Page <span className="text-[#0b0f19] font-bold">{safePage}</span> of{" "}
            <span className="text-[#0b0f19] font-bold">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:border-[#c59b27] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isCurrent = pageNum === safePage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-[#0b0f19] text-[#c59b27] shadow-sm font-black"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-[#c59b27]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:border-[#c59b27] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

