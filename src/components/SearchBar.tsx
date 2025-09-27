"use client";

import { useState } from "react";
import Fuse from "fuse.js";
import { Receipt } from "@/interfaces/interfaces";

interface SearchBarProps {
  receipts: Receipt[];
  onFilter: (filtered: Receipt[]) => void;
}

export default function SearchBar({ receipts, onFilter }: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSearch(value: string) {
    setQuery(value);
    if (!value) {
      onFilter(receipts);
      return;
    }
    const fuse = new Fuse(receipts, {
      keys: ["items.name", "tags.name"],
      threshold: 0.4,
    });
    const results = fuse.search(value).map((r) => r.item);
    onFilter(results);
  }

  return (
    <input
      type="text"
      placeholder="Szukaj po nazwie lub tagu..."
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
      className="border p-2 w-full mb-4"
    />
  );
}
