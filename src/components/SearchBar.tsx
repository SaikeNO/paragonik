"use client";

import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { Receipt, Tag } from "@/interfaces/interfaces";
import {
  Search,
  Filter,
  X,
  Tag as TagIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  ArrowUpDown,
  Calendar,
  FileText,
} from "lucide-react";

interface SearchBarProps {
  receipts: Receipt[];
  onFilter: (filtered: Receipt[]) => void;
}

type SortOption = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

const SORT_OPTIONS: SortOption[] = [
  { value: "date-desc", label: "Data: od najnowszych", icon: <Calendar className="w-4 h-4" /> },
  { value: "date-asc", label: "Data: od najstarszych", icon: <Calendar className="w-4 h-4" /> },
  { value: "items-desc", label: "Liczba produktów: malejąco", icon: <FileText className="w-4 h-4" /> },
  { value: "items-asc", label: "Liczba produktów: rosnąco", icon: <FileText className="w-4 h-4" /> },
];

export default function SearchBar({ receipts, onFilter }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("/api/tags");
        if (res.ok) {
          const data = await res.json();
          setAvailableTags(data.tags);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania tagów:", error);
      }
    }
    fetchTags();
  }, []);

  const sortReceipts = (receipts: Receipt[], sortOption: string): Receipt[] => {
    const sorted = [...receipts];

    switch (sortOption) {
      case "date-desc":
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "date-asc":
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case "items-desc":
        return sorted.sort((a, b) => (b.items?.length || 0) - (a.items?.length || 0));
      case "items-asc":
        return sorted.sort((a, b) => (a.items?.length || 0) - (b.items?.length || 0));
      default:
        return sorted;
    }
  };

  useEffect(() => {
    let filtered = receipts;

    // Filtrowanie po wybranych tagach
    if (selectedTags.length > 0) {
      filtered = filtered.filter((receipt) =>
        selectedTags.some((selectedTag) => receipt.tags?.some((tag) => tag.name === selectedTag))
      );
    }

    // Filtrowanie po tekście wyszukiwania
    if (query.trim()) {
      const fuse = new Fuse(filtered, {
        keys: ["items.name", "tags.name"],
        threshold: 0.4,
      });
      filtered = fuse.search(query).map((r) => r.item);
    }

    // Sortowanie wyników
    filtered = sortReceipts(filtered, sortBy);

    onFilter(filtered);
  }, [query, selectedTags, receipts, sortBy, onFilter]);

  function toggleTag(tagName: string) {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((tag) => tag !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  }

  function clearAllFilters() {
    setQuery("");
    setSelectedTags([]);
    setSortBy("date-desc");
  }

  function getTagCount(tagName: string) {
    return receipts.filter((receipt) => receipt.tags?.some((tag) => tag.name === tagName)).length;
  }

  const currentSortOption = SORT_OPTIONS.find((option) => option.value === sortBy);

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Wyszukaj produkty, tagi..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 grow">
          {/* Tag Filter Button */}
          <button
            type="button"
            onClick={() => setShowTagFilter(!showTagFilter)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all flex-1 ${
              showTagFilter
                ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            }`}
          >
            <Filter className="w-4 h-4" />
            <div className="grow text-left">Tagi</div>
            {selectedTags.length > 0 && (
              <span
                className={`px-2 py-1 text-xs rounded-full ${showTagFilter ? "bg-blue-400" : "bg-blue-500 text-white"}`}
              >
                {selectedTags.length}
              </span>
            )}
            {showTagFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Sort Button */}
          <button
            type="button"
            onClick={() => setShowSortOptions(!showSortOptions)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all flex-1 ${
              showSortOptions
                ? "bg-purple-500 text-white border-purple-500 shadow-lg"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <div className="grow text-left">Sortowanie</div>
            {showSortOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {(query || selectedTags.length > 0 || sortBy !== "date-desc") && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl"
        >
          <X className="w-4 h-4" />
          Wyczyść
        </button>
      )}

      {/* Current Sort Display */}
      {sortBy !== "date-desc" && (
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpDown className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Aktualne sortowanie:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium shadow-sm">
              {currentSortOption?.icon}
              {currentSortOption?.label}
              <button
                type="button"
                onClick={() => setSortBy("date-desc")}
                className="text-purple-200 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Active Tag Filters */}
      {selectedTags.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Aktywne filtry tagów:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tagName) => (
              <span
                key={tagName}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium shadow-sm"
              >
                <TagIcon className="w-3 h-3" />
                {tagName}
                <button
                  type="button"
                  onClick={() => toggleTag(tagName)}
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sort Options Panel */}
      {showSortOptions && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-3 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <ArrowUpDown className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Sortuj paragony</h3>
                  <p className="text-sm text-gray-600">Wybierz sposób sortowania</p>
                </div>
              </div>
              <button
                onClick={() => setShowSortOptions(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-1 gap-3">
              {SORT_OPTIONS.map((option) => {
                const isSelected = sortBy === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortOptions(false);
                    }}
                    className={`group p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-purple-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? "bg-purple-400" : "bg-gray-100 group-hover:bg-purple-100"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <div>
                        <p className="font-medium">{option.label}</p>
                      </div>
                      {isSelected && (
                        <div className="ml-auto">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tag Filter Panel */}
      {showTagFilter && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <TagIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Filtruj po tagach</h3>
                  <p className="text-sm text-gray-600">{availableTags.length} dostępnych tagów</p>
                </div>
              </div>
              <button
                onClick={() => setShowTagFilter(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-3">
            {availableTags.length === 0 ? (
              <div className="text-center py-8">
                <TagIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Brak dostępnych tagów</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {availableTags.map((tag) => {
                    const count = getTagCount(tag.name);
                    const isSelected = selectedTags.includes(tag.name);

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.name)}
                        disabled={count === 0}
                        className={`group relative p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                            : count === 0
                            ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium truncate">{tag.name}</p>
                              <p className={`text-xs ${isSelected ? "text-blue-200" : "text-gray-500"}`}>
                                {count} {count === 1 ? "paragon" : "paragonów"}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isSelected
                                ? "bg-blue-400 text-blue-100"
                                : count === 0
                                ? "bg-gray-200 text-gray-500"
                                : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                            }`}
                          >
                            {count}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
