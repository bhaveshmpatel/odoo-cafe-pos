'use client';

import { useEffect, useState } from 'react';
import { fetcher } from '@/lib/api';
import { IFloor } from '@repo/shared-types';
import { usePosStore } from '@/store/usePosStore';
import { X } from 'lucide-react';

interface FloorPopupProps {
  onClose: () => void;
}

export default function FloorPopup({ onClose }: FloorPopupProps) {
  const [floors, setFloors] = useState<IFloor[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeTableId, setActiveTable, carts } = usePosStore();

  useEffect(() => {
    fetcher('/api/admin/floors')
      .then((res) => {
        setFloors(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleTableSelect = (floorId: string, tableId: string) => {
    setActiveTable(floorId, tableId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-8">
      <div className="bg-canvas w-full max-w-5xl h-full max-h-[80vh] rounded-xl shadow-card flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-hairline shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-primary">Select a Table</h2>
            <p className="text-muted text-sm mt-1">Choose a table to start taking an order</p>
          </div>
          {activeTableId && (
            <button onClick={onClose} className="p-2 bg-hairline-soft hover:bg-hairline rounded-full transition-colors">
              <X size={24} className="text-body" />
            </button>
          )}
        </div>

        {/* Floor Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-soft">
          {loading ? (
            <div className="flex justify-center items-center h-full">Loading floors...</div>
          ) : floors.length === 0 ? (
            <div className="flex justify-center items-center h-full text-muted">No floors configured.</div>
          ) : (
            <div className="space-y-12">
              {floors.map((floor) => (
                <div key={floor.id} className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">{floor.name}</h3>
                  <div className="relative bg-canvas border border-hairline rounded-xl shadow-subtle min-h-[400px] w-full overflow-hidden">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {floor.tables?.map((table: any) => {
                      const isActive = !!(carts && table.id && carts[table.id] && carts[table.id]!.length > 0);
                      const isSelected = activeTableId === table.id;
                      
                      return (
                        <button
                          key={table.id}
                          onClick={() => handleTableSelect(floor.id, table.id)}
                          className={`absolute flex flex-col items-center justify-center transition-all ${
                            table.shape === 'CIRCLE' ? 'rounded-full' : 'rounded-lg'
                          } ${
                            isSelected 
                              ? 'bg-brand-accent text-on-primary ring-4 ring-brand-accent/30' 
                              : isActive
                                ? 'bg-success/10 border-2 border-success text-success hover:bg-success/20'
                                : 'bg-surface-soft border border-hairline text-body hover:border-brand-accent/50 hover:bg-canvas shadow-sm'
                          }`}
                          style={{
                            left: `${table.pos_x}%`,
                            top: `${table.pos_y}%`,
                            width: `${table.width}px`,
                            height: `${table.height}px`,
                            transform: 'translate(-50%, -50%)', // Center based on x/y
                          }}
                        >
                          <span className="font-bold">{table.table_number}</span>
                          <span className="text-xs opacity-70">{table.seats} seats</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
