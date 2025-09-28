import { Calendar } from "lucide-react";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
}

export const DatePicker = ({ label, value, onChange }: DatePickerProps) => {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="
                    w-full 
                    p-3 
                    border 
                    border-gray-300 
                    rounded-lg 
                    sm:rounded-xl 
                    focus:ring-2 
                    focus:ring-blue-500 
                    focus:border-transparent 
                    text-sm 
                    sm:text-base
                    bg-white
                    appearance-none
                    [-webkit-appearance:none]
                    [color-scheme:light]
                    min-h-[48px]
                    touch-manipulation
                    font-medium
                    text-gray-900
                    placeholder:text-gray-500
                    disabled:bg-gray-100
                    disabled:text-gray-500
                    disabled:cursor-not-allowed
                    transition-all
                    duration-200
                  "
        style={{
          WebkitAppearance: "none",
          MozAppearance: "textfield",
          colorScheme: "light",
        }}
        required
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none sm:hidden">
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};
