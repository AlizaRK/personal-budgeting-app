import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, ChevronDown, Check } from 'lucide-react';
import { CustomFloatingSelectProps } from '../types/CustomFloatingSelectProps';

const CustomFloatingSelect: React.FC<CustomFloatingSelectProps> = ({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  placeholder,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(
    (opt) => opt.id === value || opt.name === value
  );

  return (
    <div className="relative flex-1" ref={containerRef}>
      <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block tracking-widest">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all border-2
          ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400 border-transparent' : 'bg-gray-50 text-gray-700 border-transparent hover:border-amber-200'}`}
      >
        <div className="flex items-center gap-2 truncate">
          {disabled ? (
            <AlertCircle size={16} />
          ) : (
            <Icon size={16} className="text-amber-500" />
          )}
          <span className="truncate">
            {disabled ? placeholder : selectedOption?.name || placeholder}
          </span>
        </div>
        {!disabled && (
          <ChevronDown
            size={16}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="max-h-[250px] overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id || opt.name);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-amber-50 transition-colors text-left"
              >
                <span className="font-bold text-sm text-gray-700">
                  {opt.name}
                </span>
                {(opt.id === value || opt.name === value) && (
                  <Check size={16} className="text-amber-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFloatingSelect;
