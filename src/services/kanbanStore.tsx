import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Deal, KanbanColumnData } from "../types/kanban";
import { kanbanColumnsMock } from "./kanbanMock";

interface KanbanStoreValue {
  columns: KanbanColumnData[];
  setColumns: (next: KanbanColumnData[]) => void;
}

const KanbanStoreContext = createContext<KanbanStoreValue | null>(null);

const normalizeColumns = (data: unknown): KanbanColumnData[] => {
  if (!Array.isArray(data)) return kanbanColumnsMock;

  return data.map((column, columnIndex) => {
    const columnObj = column as Partial<KanbanColumnData> & { deals?: unknown[] };
    const deals = Array.isArray(columnObj.deals) ? columnObj.deals : [];

    return {
      id: columnObj.id ?? `column-${columnIndex}`,
      title: columnObj.title ?? `Colonne ${columnIndex + 1}`,
      deals: deals.map((deal, dealIndex) => {
        const dealObj = deal as Partial<Deal> & {
          companyName?: string;
          contactName?: string;
          nextFollowUp?: string | null;
        };

        return {
          id: dealObj.id ?? `deal-${columnIndex}-${dealIndex}`,
          title: dealObj.title ?? dealObj.companyName ?? "Deal",
          clientName: dealObj.clientName ?? dealObj.contactName ?? "Client",
          priority: dealObj.priority ?? "low",
          nextFollowUpDate: dealObj.nextFollowUpDate ?? dealObj.nextFollowUp ?? null,
          reminderAt:
            dealObj.reminderAt ??
            (dealObj.nextFollowUpDate || dealObj.nextFollowUp
              ? `${dealObj.nextFollowUpDate ?? dealObj.nextFollowUp}T09:00`
              : null),
          notes: dealObj.notes,
        };
      }),
    };
  });
};

export const KanbanStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storageKey = useMemo(() => "crm-kanban-columns", []);

  const loadInitialColumns = (): KanbanColumnData[] => {
    if (typeof window === "undefined") return kanbanColumnsMock;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return kanbanColumnsMock;

    try {
      const parsed = JSON.parse(raw) as unknown;
      return normalizeColumns(parsed);
    } catch {
      return kanbanColumnsMock;
    }
  };

  const [columns, setColumns] = useState<KanbanColumnData[]>(loadInitialColumns);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(columns));
  }, [columns, storageKey]);

  return (
    <KanbanStoreContext.Provider value={{ columns, setColumns }}>
      {children}
    </KanbanStoreContext.Provider>
  );
};

export const useKanbanStore = () => {
  const ctx = useContext(KanbanStoreContext);
  if (!ctx) {
    throw new Error("useKanbanStore must be used within KanbanStoreProvider");
  }
  return ctx;
};
