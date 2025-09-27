"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "@/interfaces/interfaces";

export default function NewReceiptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<string[]>([""]);
  const [date, setDate] = useState<string>("");
  const [error, setError] = useState("");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const router = useRouter();

  // Pobierz dostępne tagi przy załadowaniu komponentu
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

  function handleItemChange(index: number, value: string) {
    setItems(items.map((item, i) => (i === index ? value : item)));
  }

  function addItemField() {
    setItems([...items, ""]);
  }

  function removeItemField(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function toggleTag(tagName: string) {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((tag) => tag !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  }

  function addNewTag() {
    const trimmedTag = newTagInput.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      // Dodaj do listy dostępnych tagów (lokalnie)
      if (!availableTags.some((tag) => tag.name === trimmedTag)) {
        setAvailableTags([...availableTags, { id: `temp-${Date.now()}`, name: trimmedTag }]);
      }
    }
    setNewTagInput("");
    setShowNewTagInput(false);
  }

  function removeSelectedTag(tagName: string) {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagName));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Wybierz plik");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("items", JSON.stringify(items.filter((item) => item.trim() !== "")));
    formData.append("tags", JSON.stringify(selectedTags));
    if (date) formData.append("date", date);

    try {
      const res = await fetch("/api/receipts/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/receipts");
      } else {
        const data = await res.json();
        setError(data.error || "Wystąpił błąd");
      }
    } catch {
      setError("Wystąpił błąd podczas wysyłania");
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold ">Dodaj paragon</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => router.back()}>
          Anuluj
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        {/* Pole pliku */}
        <div className="mb-4">
          <label className="font-bold mb-2 block">Plik paragonu:</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        {/* Pole daty */}
        <div className="mb-4">
          <label className="font-bold mb-2 block">Data paragonu:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        {/* Pozycje paragonu */}
        <div className="mb-4">
          <label className="font-bold mb-2 block">Pozycje paragonu:</label>
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(idx, e.target.value)}
                placeholder={`Pozycja ${idx + 1}`}
                className="border p-2 flex-1 rounded"
              />
              <button
                type="button"
                onClick={() => removeItemField(idx)}
                className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                disabled={items.length === 1}
              >
                Usuń
              </button>
            </div>
          ))}
          <div className="flex justify-center mt-2">
            <button
              type="button"
              onClick={addItemField}
              className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
            >
              Dodaj pozycję
            </button>
          </div>
        </div>

        {/* Sekcja tagów */}
        <div className="mb-4">
          <label className="font-bold mb-2 block">Tagi:</label>

          {/* Wybrane tagi */}
          {selectedTags.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Wybrane tagi:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeSelectedTag(tag)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dostępne tagi */}
          {availableTags.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Dostępne tagi:</p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={`px-2 py-1 rounded text-sm border transition-colors ${
                      selectedTags.includes(tag.name)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dodawanie nowego tagu */}
          <div className="mt-3">
            {!showNewTagInput ? (
              <button
                type="button"
                onClick={() => setShowNewTagInput(true)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                + Dodaj nowy tag
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Nazwa nowego tagu"
                  className="border p-2 flex-1 rounded text-sm"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNewTag())}
                />
                <button
                  type="button"
                  onClick={addNewTag}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Dodaj
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTagInput(false);
                    setNewTagInput("");
                  }}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                >
                  Anuluj
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Przycisk wysyłania */}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">
          Dodaj paragon
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  );
}
