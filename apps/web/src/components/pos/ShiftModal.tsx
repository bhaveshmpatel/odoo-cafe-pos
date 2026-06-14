"use client";

import { useState, useEffect } from "react";
import { Loader2, DollarSign, LogOut } from "lucide-react";

interface Props {
  token: string;
  onShiftOpen: () => void;
  isOpen: boolean;
  onClose: () => void;
  isClosingShift: boolean; // if true, it's a 'Close Shift' dialog
}

export function ShiftModal({ token, onShiftOpen, isOpen, onClose, isClosingShift }: Props) {
  const [cashAmount, setCashAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashAmount) return;
    
    setIsProcessing(true);
    
    try {
      const endpoint = isClosingShift ? '/api/pos/shifts/close' : '/api/pos/shifts/open';
      const body = isClosingShift 
        ? { ending_cash: parseFloat(cashAmount), expected_cash: null, notes } 
        : { starting_cash: parseFloat(cashAmount) };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        onShiftOpen();
        onClose();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="p-6 text-center border-b border-hairline bg-surface-soft">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isClosingShift ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
            {isClosingShift ? <LogOut size={32} /> : <DollarSign size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-ink">
            {isClosingShift ? "Close Shift" : "Open Shift"}
          </h2>
          <p className="text-muted mt-2">
            {isClosingShift ? "Count the drawer and enter the ending cash balance." : "Enter the starting cash amount in the drawer to begin."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-bold text-muted uppercase tracking-wider mb-2">
              {isClosingShift ? "Ending Cash Amount" : "Starting Cash Amount"}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted">$</span>
              <input 
                type="number" 
                step="0.01"
                required
                autoFocus
                value={cashAmount}
                onChange={e => setCashAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 text-lg font-bold bg-surface-soft border border-hairline rounded-xl text-ink outline-none focus:border-brand"
                placeholder="0.00"
              />
            </div>
          </div>

          {isClosingShift && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-muted uppercase tracking-wider mb-2">
                Shift Notes (Optional)
              </label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-4 py-3 bg-surface-soft border border-hairline rounded-xl text-ink outline-none focus:border-brand"
                placeholder="Any discrepancies?"
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {isClosingShift && (
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-ink bg-surface-soft hover:bg-surface-strong transition-colors"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              disabled={isProcessing}
              className={`flex-1 py-3 rounded-xl font-bold text-on-primary transition-colors flex items-center justify-center gap-2 ${
                isClosingShift ? 'bg-error hover:bg-error/90' : 'bg-brand hover:bg-brand-dark'
              }`}
            >
              {isProcessing && <Loader2 className="animate-spin" size={18} />}
              {isClosingShift ? "End Shift" : "Start Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
