"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "@/interfaces/interfaces";
import {
  Upload,
  Calendar,
  ShoppingCart,
  Tag as TagIcon,
  Plus,
  X,
  ArrowLeft,
  FileText,
  Check,
  Trash2,
} from "lucide-react";

export default function NewReceiptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<string[]>([""]);
  const [date, setDate] = useState<string>("");
  const [error, setError] = useState("");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);

    if (!file) {
      setError("Wybierz plik");
      setIsSubmitting(false);
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
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Dodaj paragon</h1>
                  <p className="text-blue-100 text-sm">Wypełnij poniższe pola aby dodać nowy paragon</p>
                </div>
              </div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Anuluj
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plik */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Plik paragonu</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                  Kliknij aby wybrać plik
                </label>
                <p className="text-sm text-gray-500 mt-1">lub przeciągnij i upuść</p>
                {file && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">{file.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Data zakupu</h2>
              </div>
            </div>
            <div className="p-6">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Produkty */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Produkty</h2>
                </div>
                <span className="text-sm text-gray-500">{items.filter((i) => i.trim()).length} pozycji</span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleItemChange(idx, e.target.value)}
                        placeholder={`Nazwa produktu ${idx + 1}`}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItemField(idx)}
                      disabled={items.length === 1}
                      className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItemField}
                className="mt-4 w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Dodaj kolejny produkt
              </button>
            </div>
          </div>

          {/* Tagi */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <TagIcon className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Tagi</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Wybrane tagi */}
              {selectedTags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Wybrane tagi:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeSelectedTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dostępne tagi */}
              {availableTags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Dostępne tagi:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.name)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedTags.includes(tag.name)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dodawanie nowego tagu */}
              <div className="pt-4 border-t border-gray-200">
                {!showNewTagInput ? (
                  <button
                    type="button"
                    onClick={() => setShowNewTagInput(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj nowy tag
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="Nazwa nowego tagu"
                      className="flex-1 p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNewTag())}
                    />
                    <button
                      type="button"
                      onClick={addNewTag}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewTagInput(false);
                        setNewTagInput("");
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Przycisk submit */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Dodawanie...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Dodaj paragon
                </>
              )}
            </button>
          </div>

          {/* Błąd */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-600 font-medium flex items-center gap-2">
                <X className="w-5 h-5" />
                {error}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
