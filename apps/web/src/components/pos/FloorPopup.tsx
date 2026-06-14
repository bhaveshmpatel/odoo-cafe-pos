"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Lock } from "lucide-react";
import { IFloor, IDiningTable } from "@repo/shared-types";
import { usePosStore } from "@/store/usePosStore";

interface Props {
  onClose: () => void;
  token: string;
}

export function FloorPopup({ onClose, token }: Props) {
  const [floors, setFloors] = useState<IFloor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const activeTableId = usePosStore((state) => state.activeTableId);
  const activeFloorId = usePosStore((state) => state.activeFloorId);
  const carts = usePosStore((state) => state.carts);
  const setActiveTable = usePosStore((state) => state.setActiveTable);
  const setActiveFloor = usePosStore((state) => state.setActiveFloor);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/pos/floors`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFloors(data.data);
          if (!activeFloorId && data.data.length > 0) {
            setActiveFloor(data.data[0].id);
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, [activeFloorId, setActiveFloor]);

  const activeFloor = floors.find(f => f.id === (activeFloorId || floors[0]?.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
      <div className="bg-canvas rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden border border-hairline">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-hairline bg-surface-soft">
          <h2 className="text-lg font-semibold text-ink">Select Dining Table</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface-strong rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-ink" />
          </button>
        </div>

        {/* Floor Tabs */}
        <div className="flex items-center gap-2 p-4 border-b border-hairline overflow-x-auto">
          {floors.map(floor => (
            <button
              key={floor.id}
              onClick={() => setActiveFloor(floor.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                (activeFloorId || floors[0]?.id) === floor.id
                  ? 'bg-ink text-canvas'
                  : 'bg-surface-card hover:bg-surface-strong text-ink border border-hairline'
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>

        {/* Floor Plan Area */}
        <div className="flex-1 bg-surface-card relative overflow-auto p-8">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
          ) : activeFloor?.tables?.length ? (
            <div className="relative w-full h-full min-h-[600px] min-w-[800px]">
              {activeFloor.tables.map((table: IDiningTable) => {
                const hasActiveCart = (carts[table.id]?.length ?? 0) > 0;
                const isSelected = activeTableId === table.id;
                
                return (
                  <button
                    key={table.id}
                    disabled={!table.is_active}
                    onClick={() => {
                      if (!table.is_active) return;
                      setActiveTable(table.id, table.name);
                      onClose();
                    }}
                    style={{
                      position: 'absolute',
                      left: `${table.pos_x}%`,
                      top: `${table.pos_y}%`,
                      width: `${table.width}px`,
                      height: `${table.height}px`,
                      borderRadius: table.shape === 'CIRCLE' ? '50%' : '8px',
                    }}
                    className={`
                      flex flex-col items-center justify-center text-sm font-bold shadow-md transition-all
                      ${table.is_active ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-not-allowed bg-error/20 border-2 border-error text-error-dark opacity-80'}
                      ${isSelected ? 'ring-4 ring-brand-accent ring-offset-2' : ''}
                      ${table.is_active && hasActiveCart 
                        ? 'bg-success/20 border-2 border-success text-success-dark' 
                        : (table.is_active ? 'bg-canvas border border-hairline text-ink' : '')
                      }
                    `}
                  >
                    {!table.is_active && <Lock className="w-4 h-4 mb-0.5 opacity-80" />}
                    <span>T{table.table_number}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              No tables configured for this floor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
