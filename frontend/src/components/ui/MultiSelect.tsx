import React, { useState, useEffect, useRef } from 'react';
import { X, Check, ChevronsUpDown } from 'lucide-react';

export interface Option {
    id: string | number;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    selected: (string | number)[];
    onChange: (selected: (string | number)[]) => void;
    placeholder?: string;
    creatable?: boolean;
    onCreate?: (option: Option) => void;
    label?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    selected,
    onChange,
    placeholder = "Select...",
    creatable = false,
    onCreate,
    label
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option: Option) => {
        if (selected.includes(option.id)) {
            onChange(selected.filter(id => id !== option.id));
        } else {
            onChange([...selected, option.id]);
        }
    };

    const handleRemove = (id: string | number) => {
        onChange(selected.filter(s => s !== id));
    };

    const handleCreate = () => {
        if (creatable && onCreate && searchTerm) {
            const newOption = { id: searchTerm, label: searchTerm };
            onCreate(newOption);
            handleSelect(newOption);
            setSearchTerm("");
        }
    };

    const showCreateOption = creatable && searchTerm && !filteredOptions.find(o => o.label.toLowerCase() === searchTerm.toLowerCase());

    return (
        <div ref={wrapperRef} className="relative space-y-2">
            {label && <label className="text-gray-400 font-medium">{label}</label>}

            <div
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 min-h-[42px] flex flex-wrap gap-2 cursor-text focus-within:ring-2 focus-within:ring-amber-500/50"
                onClick={() => setIsOpen(true)}
            >
                {/* Selected Chips */}
                {selected.map(id => {
                    const opt = options.find(o => o.id === id) || { id, label: String(id) };
                    return (
                        <span key={id} className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1">
                            {opt.label}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemove(id); }}
                                className="hover:text-red-400"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    );
                })}

                {/* Search Input */}
                <input
                    type="text"
                    className="bg-transparent text-white outline-none flex-1 min-w-[120px] text-sm"
                    placeholder={selected.length === 0 ? placeholder : ""}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (showCreateOption) handleCreate();
                        }
                        if (e.key === 'Backspace' && !searchTerm && selected.length > 0) {
                            handleRemove(selected[selected.length - 1]);
                        }
                    }}
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredOptions.map(option => {
                        const isSelected = selected.includes(option.id);
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-800 transition-colors ${isSelected ? 'text-amber-500 bg-amber-500/10' : 'text-gray-300'
                                    }`}
                            >
                                {option.label}
                                {isSelected && <Check className="w-4 h-4" />}
                            </button>
                        );
                    })}

                    {showCreateOption && (
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-gray-800 transition-colors"
                        >
                            Create "{searchTerm}"
                        </button>
                    )}

                    {!showCreateOption && filteredOptions.length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
