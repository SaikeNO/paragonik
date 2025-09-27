"use client";

import ReceiptCard from "@/components/ReceiptCard";
import SearchBar from "@/components/SearchBar";
import { Receipt } from "@/interfaces/interfaces";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filtered, setFiltered] = useState<Receipt[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/receipts/search")
      .then((res) => res.json())
      .then((data) => {
        const orderedReceipts = data.receipts.sort(
          (a: Receipt, b: Receipt) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const receipts = orderedReceipts.map((r: Receipt) => ({
          ...r,
          date: new Date(r.date).toLocaleDateString("pl-PL"),
        }));
        setReceipts(receipts);
        setFiltered(receipts);
      });
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">Twoje paragony</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => router.push("/receipts/new")}>
          Dodaj
        </button>
      </div>
      <SearchBar receipts={receipts} onFilter={setFiltered} />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {filtered.map((r) => (
          <ReceiptCard key={r.id} receipt={r} />
        ))}
      </div>
    </div>
  );
}
