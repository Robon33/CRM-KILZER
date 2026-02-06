export type DealPriority = "low" | "medium" | "high";

export interface Column {
  id: string;
  title: string;
  position: number;
  userId?: string | null;
}

export interface Deal {
  id: string;
  title: string;
  clientName: string;
  priority: DealPriority;
  nextFollowUpDate: string | null;
  reminderAt: string | null;
  notes?: string;
  amount?: number | null;
  currency?: string | null;
  tags?: string[];
  columnId?: string;
  position?: number;
}

export interface KanbanColumnData {
  id: string;
  title: string;
  deals: Deal[];
}

export interface Note {
  id: string;
  dealId: string;
  body: string;
  createdAt?: string;
}

export interface Reminder {
  id: string;
  dealId: string;
  remindAt: string;
}

export interface ActivityEvent {
  id: string;
  type: string;
  dealId?: string | null;
  columnId?: string | null;
  payload?: string | null;
  createdAt?: string | null;
}
