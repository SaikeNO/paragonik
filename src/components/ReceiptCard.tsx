import { Receipt } from "@/interfaces/interfaces";

export default function ReceiptCard({ receipt }: { receipt: Receipt }) {
  const isExpired =
    receipt.date && new Date(receipt.date) < new Date(new Date().setFullYear(new Date().getFullYear() - 2));

  return (
    <div className="border rounded p-4">
      <p>
        <strong>Data:</strong> {receipt.date ? new Date(receipt.date).toLocaleDateString() : "Brak"}
      </p>
      {receipt.fileUrl && (
        <a href={receipt.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          Zobacz plik
        </a>
      )}
      <p>
        <strong>Status:</strong>{" "}
        {isExpired ? (
          <span className="text-red-600">Bez gwarancji</span>
        ) : (
          <span className="text-green-600">Na gwarancji</span>
        )}
      </p>
      <div>
        <strong>Tagi:</strong> {receipt.tags ? receipt.tags.map((t) => t.name).join(", ") : "Brak"}
      </div>
      <ul>{receipt.items ? receipt.items.map((i) => <li key={i.id}>• {i.name}</li>) : "Brak"}</ul>
    </div>
  );
}
