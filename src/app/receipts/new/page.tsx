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
import { DatePicker } from "@/components/DatePicker";

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
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mb-4 sm:mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex justify-between items-center gap-3 sm:gap-0">
              <div className="flex items-center gap-3">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Dodaj paragon</h1>
                  <p className="text-blue-100 text-sm hidden sm:block">Wypełnij poniższe pola aby dodać nowy paragon</p>
                </div>
              </div>
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm self-start sm:self-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm sm:text-base">Anuluj</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Plik */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Plik paragonu</h2>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2 sm:mb-3" />
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
                >
                  Kliknij aby wybrać plik
                </label>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">lub przeciągnij i upuść</p>
                {file && (
                  <div className="mt-2 sm:mt-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800 font-medium truncate">{file.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Data */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Data zakupu</h2>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <DatePicker label="Wybierz datę zakupu" value={date} onChange={setDate} />
            </div>
          </div>
          {/* Produkty */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">Produkty</h2>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {items.filter((i) => i.trim()).length} pozycji
                </span>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 sm:gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleItemChange(idx, e.target.value)}
                        placeholder={`Nazwa produktu ${idx + 1}`}
                        className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItemField(idx)}
                      disabled={items.length === 1}
                      className="p-2.5 sm:p-3 bg-red-100 text-red-600 rounded-lg sm:rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItemField}
                className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-2 p-2.5 sm:p-3 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors text-sm sm:text-base touch-manipulation"
              >
                <Plus className="w-4 h-4" />
                Dodaj kolejny produkt
              </button>
            </div>
          </div>
          {/* Tagi */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <TagIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Tagi</h2>
                {selectedTags.length > 0 && (
                  <span className="text-xs sm:text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded-full">
                    {selectedTags.length} wybranych
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Wybrane tagi */}
              {selectedTags.length > 0 && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Wybrane tagi:</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium"
                      >
                        <span className="truncate max-w-24 sm:max-w-none">{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedTag(tag)}
                          className="text-blue-600 hover:text-blue-800 touch-manipulation"
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
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Dostępne tagi:</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.name)}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                          selectedTags.includes(tag.name)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span className="truncate">{tag.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dodawanie nowego tagu */}
              <div className="pt-3 sm:pt-4 border-t border-gray-200">
                {!showNewTagInput ? (
                  <button
                    type="button"
                    onClick={() => setShowNewTagInput(true)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg sm:rounded-xl hover:bg-green-200 transition-colors text-sm sm:text-base touch-manipulation"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj nowy tag
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="Nazwa nowego tagu"
                      className="flex-1 p-2 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNewTag())}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addNewTag}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg sm:rounded-xl hover:bg-green-700 transition-colors touch-manipulation"
                      >
                        <Check className="w-4 h-4 mx-auto sm:mx-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewTagInput(false);
                          setNewTagInput("");
                        }}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg sm:rounded-xl hover:bg-gray-600 transition-colors touch-manipulation"
                      >
                        <X className="w-4 h-4 mx-auto sm:mx-0" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Błąd */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <p className="text-red-600 font-medium flex items-center gap-2 text-sm sm:text-base">
                <X className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* Przycisk submit */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] touch-manipulation text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Dodawanie...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  Dodaj paragon
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
