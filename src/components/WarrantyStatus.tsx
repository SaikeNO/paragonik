import { ShieldX, Shield } from "lucide-react";

interface WarrantyStatusProps {
  isExpired: boolean;
}

export default function WarrantyStatus({ isExpired }: WarrantyStatusProps) {
  return (
    <div className="flex items-center gap-2 ">
      {isExpired ? (
        <>
          <ShieldX className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs sm:text-sm font-medium rounded-full">
            Bez gwarancji
          </span>
        </>
      ) : (
        <>
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs sm:text-sm font-medium rounded-full">
            Na gwarancji
          </span>
        </>
      )}
    </div>
  );
}
