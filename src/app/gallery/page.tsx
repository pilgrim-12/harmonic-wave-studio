"use client";

import { useState } from "react";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GalleryStats } from "@/components/gallery/GalleryStats";
import { SearchBar } from "@/components/gallery/SearchBar";
import { FilterPanel } from "@/components/gallery/FilterPanel";
import { FeaturedSection } from "@/components/gallery/FeaturedSection";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GallerySortOption } from "@/services/galleryService";

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<GallerySortOption>("recent");

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="secondary" className="mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to Studio
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <LayoutGrid size={28} className="text-[#667eea]" />
            <h1 className="text-3xl font-bold text-white">Community Gallery</h1>
          </div>

          <p className="text-gray-400 mb-6">
            Discover amazing harmonic wave projects created by the community
          </p>

          {/* Stats */}
          <GalleryStats />
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterPanel sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        {/* Featured Section */}
        <FeaturedSection />

        {/* Divider */}
        <div className="border-t border-[#2a2a2a] my-8" />

        {/* All Projects Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">All Projects</h2>
          <p className="text-sm text-gray-500 mt-1">
            Browse all shared projects
          </p>
        </div>

        {/* Projects Grid */}
        <GalleryGrid searchQuery={searchQuery} sortBy={sortBy} />
      </div>
    </div>
  );
}
