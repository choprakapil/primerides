"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { BlogItemDTO } from "@/server/cms";

interface BlogPaginationListProps {
  blogs: BlogItemDTO[];
}

export default function BlogPaginationList({ blogs }: BlogPaginationListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Extract unique categories from blogs
  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.categoryName) set.add(b.categoryName);
    });
    return ["all", ...Array.from(set)];
  }, [blogs]);

  // Filter blogs based on category & search
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCategory =
        selectedCategory === "all" ||
        b.categoryName?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.authorName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [blogs, selectedCategory, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage) || 1;
  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBlogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBlogs, currentPage, itemsPerPage]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>PrimeRides Travel Desk &amp; Expedition Notes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Curated Road Trips &amp; Driving Guides
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mt-1.5 leading-relaxed">
            Tested mountain passes, weekend getaway circuits from Delhi NCR, highway insights, and vehicle advice from our fleet captains.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="w-full md:w-80 relative shrink-0">
          <input
            type="text"
            placeholder="Search articles, routes..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:border-amber-400 transition-colors text-slate-900 placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                isSelected
                  ? "bg-slate-900 text-amber-400 shadow-sm"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80"
              }`}
            >
              {cat === "all" ? "All Travel Guides" : cat}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-6">
        <span>
          Showing{" "}
          <strong className="text-slate-800">
            {filteredBlogs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          </strong>{" "}
          to{" "}
          <strong className="text-slate-800">
            {Math.min(currentPage * itemsPerPage, filteredBlogs.length)}
          </strong>{" "}
          of <strong className="text-slate-800">{filteredBlogs.length}</strong> articles
        </span>
      </div>

      {/* Blog Cards Grid */}
      {paginatedBlogs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-md mx-auto my-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Articles Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              We couldn't find any guides matching "{searchQuery}". Try searching for another topic or resetting filters.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedBlogs.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(197,155,39,0.12)] hover:border-amber-400/70 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Image & Category Tag */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={post.featuredImage || "/assets/img/blog/1.jpg"}
                  alt={post.title || "PrimeRides Travel Guide"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-900/85 backdrop-blur-md text-amber-400 border border-amber-400/20 shadow-sm">
                    {post.categoryName || "Road Trip"}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      {post.publishedAt}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>

                {/* Footer & Read Link */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200">
                      {post.authorName ? post.authorName.charAt(0) : "P"}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[130px]">
                      {post.authorName || "PrimeRides Desk"}
                    </span>
                  </div>

                  <Link
                    href={`/blogs/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 pt-8 border-t border-slate-200/80 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-amber-400 shadow-sm"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
