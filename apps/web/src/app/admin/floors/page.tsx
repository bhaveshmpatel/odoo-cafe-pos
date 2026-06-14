"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, Save, Undo2, Plus, Trash2, Lock, Unlock } from "lucide-react";
import { useSession } from "next-auth/react";
import { IFloor, IDiningTable, TableShape } from "@repo/shared-types";

export default function FloorPlanBuilder() {
  const { data: session } = useSession();
  
  const [floors, setFloors] = useState<IFloor[]>([]);
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [tables, setTables] = useState<IDiningTable[]>([]);
  const [originalTables, setOriginalTables] = useState<IDiningTable[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Drag State
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Add Floor State
  const [isAddingFloor, setIsAddingFloor] = useState(false);
  const [newFloorName, setNewFloorName] = useState("");

  useEffect(() => {
    if (session) fetchFloors();
  }, [session]);

  const fetchFloors = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any)?.token;
      if (!token) return;
      
      const res = await fetch(`${apiUrl}/api/admin/floors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setFloors(json.data);
          if (json.data.length > 0 && !activeFloorId) {
            handleSelectFloor(json.data[0]);
          } else if (activeFloorId) {
            const active = json.data.find((f: any) => f.id === activeFloorId);
            if (active) handleSelectFloor(active);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFloor = (floor: IFloor) => {
    setActiveFloorId(floor.id);
    const floorTables = floor.tables || [];
    setTables(floorTables);
    setOriginalTables(JSON.parse(JSON.stringify(floorTables))); // deep copy for undo
    setHasChanges(false);
  };

  const handlePointerDown = (e: React.PointerEvent, tableId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if right click
    if (e.button !== 0) return;
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingTableId(tableId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTableId || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate new position relative to container
    let newX = ((e.clientX - rect.left) / rect.width) * 100;
    let newY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp to 0-100
    newX = Math.max(0, Math.min(newX, 95));
    newY = Math.max(0, Math.min(newY, 95));

    setTables(prev => prev.map(t => 
      t.id === draggingTableId 
        ? { ...t, pos_x: newX, pos_y: newY }
        : t
    ));
    setHasChanges(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingTableId) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingTableId(null);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any).token;

      // Find changed tables
      const promises = tables.map(async (table) => {
        const original = originalTables.find(t => t.id === table.id);
        if (original && (original.pos_x !== table.pos_x || original.pos_y !== table.pos_y)) {
          return fetch(`${apiUrl}/api/admin/floors/tables/${table.id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ pos_x: table.pos_x, pos_y: table.pos_y })
          });
        }
      });

      await Promise.all(promises);
      
      // Update original state
      setOriginalTables(JSON.parse(JSON.stringify(tables)));
      setHasChanges(false);
      
      // Also update floors state to keep in sync
      setFloors(prev => prev.map(f => {
        if (f.id === activeFloorId) {
          return { ...f, tables: tables };
        }
        return f;
      }));
      
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = () => {
    setTables(JSON.parse(JSON.stringify(originalTables)));
    setHasChanges(false);
  };

  const handleAddFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any).token;

      const res = await fetch(`${apiUrl}/api/admin/floors`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newFloorName, sort_order: floors.length + 1 })
      });

      if (res.ok) {
        setIsAddingFloor(false);
        setNewFloorName("");
        fetchFloors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTable = async () => {
    if (!activeFloorId) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any).token;

      const nextTableNum = tables.length > 0 ? Math.max(...tables.map(t => t.table_number)) + 1 : 1;

      const res = await fetch(`${apiUrl}/api/admin/floors/tables`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          floor_id: activeFloorId,
          table_number: nextTableNum,
          pos_x: 50,
          pos_y: 50,
          width: 80,
          height: 80,
          shape: TableShape.RECTANGLE,
          capacity: 4
        })
      });

      if (res.ok) {
        fetchFloors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm("Delete table?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any).token;

      const res = await fetch(`${apiUrl}/api/admin/floors/tables/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchFloors();
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleToggleReserve = async (id: string, currentIsActive: boolean) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
      const token = (session?.user as any).token;

      const res = await fetch(`${apiUrl}/api/admin/floors/tables/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ is_active: !currentIsActive })
      });

      if (res.ok) {
        fetchFloors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in">
      {/* Header */}
      <div className="bg-canvas border-b border-hairline p-6 flex items-center justify-between shadow-sm z-10">
        <div>
          <h1 className="text-3xl font-bold text-ink">Floor Plan Builder</h1>
          <p className="text-muted mt-1">Drag tables to adjust their positions or add new ones.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleAddTable}
            disabled={!activeFloorId}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-hairline bg-surface-card hover:bg-surface-soft disabled:opacity-50 transition-all"
          >
            <Plus size={18} />
            Add Table
          </button>
          <div className="w-px bg-hairline mx-2"></div>
          <button 
            onClick={handleUndo}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-hairline bg-surface-card hover:bg-surface-soft disabled:opacity-50 transition-all"
          >
            <Undo2 size={18} />
            Undo
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all shadow-sm ${
              hasChanges 
                ? 'bg-brand text-on-primary hover:bg-brand-dark' 
                : 'bg-surface-soft text-ink hover:bg-surface-strong'
            }`}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {hasChanges ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Floor List Sidebar */}
        <div className="w-64 bg-surface-card border-r border-hairline p-4 flex flex-col gap-2 overflow-y-auto z-10 shadow-sm">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Floors</h3>
            <button onClick={() => setIsAddingFloor(!isAddingFloor)} className="text-brand hover:bg-brand/10 p-1 rounded">
              <Plus size={16} />
            </button>
          </div>

          {isAddingFloor && (
            <form onSubmit={handleAddFloor} className="flex gap-2 mb-2">
              <input 
                autoFocus
                type="text" 
                value={newFloorName} 
                onChange={e => setNewFloorName(e.target.value)}
                placeholder="Floor Name" 
                className="flex-1 bg-surface-soft border border-hairline rounded px-2 py-1 text-sm outline-none focus:border-brand"
              />
              <button type="submit" className="bg-brand text-on-primary px-2 py-1 rounded text-sm font-medium">Add</button>
            </form>
          )}

          {floors.map(floor => (
            <button
              key={floor.id}
              onClick={() => handleSelectFloor(floor)}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-all ${
                activeFloorId === floor.id 
                  ? 'bg-brand/10 text-brand border border-brand/20' 
                  : 'text-ink/80 hover:bg-surface-soft border border-transparent'
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>

        {/* Builder Canvas */}
        <div className="flex-1 bg-surface-soft/50 p-8 overflow-auto relative">
          
          <div 
            ref={containerRef}
            className="w-full max-w-4xl aspect-[4/3] bg-canvas border-2 border-dashed border-hairline rounded-2xl relative shadow-sm mx-auto overflow-hidden touch-none group"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Grid Pattern Background */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{
                backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            ></div>

            {tables.map(table => (
              <div
                key={table.id}
                onPointerDown={(e) => handlePointerDown(e, table.id)}
                className={`
                  absolute w-20 h-20 bg-surface-card border-2 shadow-sm rounded-xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none transition-shadow
                  ${draggingTableId === table.id ? 'border-brand shadow-lg scale-105 z-20' : 'border-hairline z-10 hover:border-brand/50 hover:shadow-md'}
                `}
                style={{
                  left: `${table.pos_x}%`,
                  top: `${table.pos_y}%`,
                  transform: 'translate(-50%, -50%)', // Center on cursor
                  touchAction: 'none'
                }}
              >
                {/* Reserve Overlay Indicator */}
                {!table.is_active && (
                  <div className="absolute inset-0 bg-error/10 flex items-center justify-center rounded-xl pointer-events-none">
                    <Lock size={32} className="text-error/30 absolute" />
                  </div>
                )}
                
                <div className="text-center pointer-events-none z-10 relative">
                  <div className={`font-bold text-lg leading-none ${table.is_active ? 'text-ink' : 'text-error line-through decoration-2'}`}>{table.table_number}</div>
                  <div className="text-[10px] font-medium text-muted mt-1 uppercase tracking-wider">{table.capacity} Pax</div>
                </div>
                
                {/* Delete Button (visible on hover) */}
                <button 
                  onPointerDown={(e) => { e.stopPropagation(); handleDeleteTable(table.id); }}
                  className="absolute -top-3 -right-3 bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 transition-all z-30 shadow-md"
                  title="Delete Table"
                >
                  <Trash2 size={14} />
                </button>

                {/* Reserve/Unreserve Button (visible on hover) */}
                <button 
                  onPointerDown={(e) => { e.stopPropagation(); handleToggleReserve(table.id, table.is_active); }}
                  className={`absolute -top-3 -left-3 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 transition-all z-30 shadow-md ${table.is_active ? 'bg-amber-500' : 'bg-success'}`}
                  title={table.is_active ? "Reserve Table" : "Unreserve Table"}
                >
                  {table.is_active ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
              </div>
            ))}

            {tables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted font-medium pointer-events-none">
                No tables on this floor. Click 'Add Table' to start.
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
