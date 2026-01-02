"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface HeroSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function HeroSearch({
  onSearch,
  placeholder = "Search prompts, keywords, or describe what you need...",
}: HeroSearchProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        // Navigate to marketplace with search params
        router.push(`/marketplace?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-2xl mt-3"
      role="search"
    >
      <div className="relative flex items-center">
        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search prompts"
          className="w-full px-5 py-2.5 pr-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />

        {/* Search Button */}
        <button
          type="submit"
          aria-label="Submit search"
          className="absolute right-0.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Helpful hint */}
      <p className="text-xs text-gray-500 mt-1.5">
        Try: "anime portraits", "product mockups", "code snippets"
      </p>
    </form>
  );
}
