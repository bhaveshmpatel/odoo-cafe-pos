"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { IProduct } from "@repo/shared-types";

interface Props {
  product: IProduct;
  onClose: () => void;
  onAdd: (modifiers: string[]) => void;
}

// Hardcoded common modifiers for this example (can be fetched from DB later)
const COMMON_MODIFIERS = [
  "No Onions", "Extra Cheese", "To-Go", "Spicy", "Mild", "No Tomato", "Extra Sauce", "Ice Level: 50%"
];

export function ModifiersModal({ product, onClose, onAdd }: Props) {
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");

  const toggleModifier = (mod: string) => {
    setSelectedModifiers(prev => 
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const handleAdd = () => {
    const finalMods = [...selectedModifiers];
    if (customNote.trim()) {
      finalMods.push(customNote.trim());
    }
    onAdd(finalMods);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-hairline flex items-center justify-between bg-canvas">
          <h2 className="text-xl font-bold text-ink">Customize {product.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-soft rounded-full text-muted transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Quick Modifiers</h3>
            <div className="flex flex-wrap gap-2">
              {COMMON_MODIFIERS.map(mod => {
                const isSelected = selectedModifiers.includes(mod);
                return (
                  <button
                    key={mod}
                    onClick={() => toggleModifier(mod)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
                      isSelected 
                        ? 'bg-brand/10 border-brand text-brand' 
                        : 'bg-surface-soft border-transparent text-ink hover:bg-surface-strong'
                    }`}
                  >
                    {isSelected && <Check size={14} />}
                    {mod}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Custom Note</h3>
            <input 
              type="text" 
              placeholder="e.g. Allergy to peanuts" 
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              className="w-full px-4 py-3 bg-surface-soft border border-hairline rounded-xl text-ink outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="p-4 border-t border-hairline bg-canvas flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-ink bg-surface-soft hover:bg-surface-strong transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleAdd}
            className="flex-1 py-3 rounded-xl font-bold text-on-primary bg-brand hover:bg-brand-dark transition-colors shadow-md"
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}
