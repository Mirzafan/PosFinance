import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  min?: string;
  max?: string;
}

export default function DateInput({
  value,
  onChange,
  className = '',
  required = false,
  disabled = false,
  name,
  id,
  min,
  max,
}: DateInputProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Format date from YYYY-MM-DD or ISO string to dd/mm/yy
  const formatDisplayDate = (val: string) => {
    if (!val) return '';
    const cleanDate = val.split('T')[0].split(' ')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const [yyyy, mm, dd] = parts;
      const yy = yyyy.slice(-2);
      return `${dd}/${mm}/${yy}`;
    }
    return val;
  };

  const handleContainerClick = () => {
    if (disabled) return;
    if (hiddenInputRef.current) {
      if (typeof hiddenInputRef.current.showPicker === 'function') {
        try {
          hiddenInputRef.current.showPicker();
        } catch {
          hiddenInputRef.current.focus();
        }
      } else {
        hiddenInputRef.current.focus();
      }
    }
  };

  const formattedText = formatDisplayDate(value);

  return (
    <div
      onClick={handleContainerClick}
      className={`relative inline-flex items-center justify-between cursor-pointer select-none transition-all ${className}`}
    >
      {/* Invisible Native Input overlaid to trigger picker */}
      <input
        ref={hiddenInputRef}
        type="date"
        value={value ? value.split('T')[0].split(' ')[0] : ''}
        onChange={onChange}
        required={required}
        disabled={disabled}
        name={name}
        id={id}
        min={min}
        max={max}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 font-sans"
      />

      {/* Visible Formatted Date Display in dd/mm/yy */}
      <span className={`truncate ${formattedText ? '' : 'text-slate-400 font-normal'}`}>
        {formattedText || 'dd/mm/yy'}
      </span>

      {/* Calendar Icon on right */}
      <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0 ml-2 pointer-events-none" />
    </div>
  );
}
