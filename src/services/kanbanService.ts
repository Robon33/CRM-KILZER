import { supabase } from "../supabaseClient";
import type { ActivityEvent, Column, Deal, Note, Reminder } from "../types/kanban";

// Columns
export const fetchColumns = async (): Promise<Column[]> => {
  const { data, error } = await supabase
    .from("columns")
    .select("id,title,position")
    .order("position", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    position: row.position,
    userId: null,
  }));
};

export const createColumn = async (title: string, position: number): Promise<Column> => {
  const { data, error } = await supabase
    .from("columns")
    .insert({ title, position })
    .select("id,title,position")
    .single();
  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    position: data.position,
    userId: null,
  };
};

export const updateColumn = async (
  id: string,
  payload: Partial<Pick<Column, "title" | "position">>
): Promise<Column> => {
  const { data, error } = await supabase
    .from("columns")
    .update({ title: payload.title, position: payload.position })
    .eq("id", id)
    .select("id,title,position")
    .single();
  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    position: data.position,
    userId: null,
  };
};

export const deleteColumn = async (id: string) => {
  const { error } = await supabase.from("columns").delete().eq("id", id);
  if (error) throw error;
};

// Deals
export const fetchDeals = async (): Promise<Deal[]> => {
  const { data, error } = await supabase
    .from("deals")
    .select("id,column_id,title,description,priority,position,amount,currency,tags,created_at,updated_at")
    .order("position", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    columnId: row.column_id,
    title: row.title,
    clientName: row.description ?? "Client",
    priority: row.priority === 3 ? "high" : row.priority === 2 ? "medium" : "low",
    position: row.position ?? undefined,
    amount: row.amount ?? null,
    currency: row.currency ?? null,
    tags: row.tags ?? [],
    nextFollowUpDate: null,
    reminderAt: null,
  }));
};

export const createDeal = async (payload: {
  columnId: string;
  title: string;
  clientName: string;
  priority: Deal["priority"];
  position: number;
  nextFollowUpDate: string | null;
  amount?: number | null;
  currency?: string | null;
  tags?: string[];
}): Promise<Deal> => {
  const safeTitle = (payload.title ?? "").trim() || "Nouveau deal";
  const safeClient = (payload.clientName ?? "").trim() || "Client";
  const { data, error } = await supabase
    .from("deals")
    .insert({
      column_id: payload.columnId,
      title: safeTitle,
      description: safeClient,
      priority: payload.priority === "high" ? 3 : payload.priority === "medium" ? 2 : 1,
      amount: payload.amount ?? null,
      currency: payload.currency ?? null,
      tags: payload.tags ?? [],
    })
    .select("id,column_id,title,description,priority,position,amount,currency,tags,created_at,updated_at")
    .single();
  if (error) throw error;

  return {
    id: data.id,
    columnId: data.column_id,
    title: data.title,
    clientName: data.description ?? "Client",
    priority: data.priority === 3 ? "high" : data.priority === 2 ? "medium" : "low",
    position: data.position ?? undefined,
    amount: data.amount ?? null,
    currency: data.currency ?? null,
    tags: data.tags ?? [],
    nextFollowUpDate: null,
    reminderAt: null,
  };
};

export const updateDeal = async (
  id: string,
  payload: Partial<Deal>
): Promise<Deal> => {
  const { data, error } = await supabase
    .from("deals")
    .update({
      column_id: payload.columnId,
      title: payload.title,
      description: payload.clientName,
      priority:
        payload.priority === "high" ? 3 : payload.priority === "medium" ? 2 : 1,
      position: payload.position,
      amount: payload.amount ?? null,
      currency: payload.currency ?? null,
      tags: payload.tags ?? [],
    })
    .eq("id", id)
    .select("id,column_id,title,description,priority,position,amount,currency,tags,created_at,updated_at")
    .single();
  if (error) throw error;

  return {
    id: data.id,
    columnId: data.column_id,
    title: data.title,
    clientName: data.description ?? "Client",
    priority: data.priority === 3 ? "high" : data.priority === 2 ? "medium" : "low",
    position: data.position ?? undefined,
    amount: data.amount ?? null,
    currency: data.currency ?? null,
    tags: data.tags ?? [],
    nextFollowUpDate: null,
    reminderAt: payload.reminderAt ?? null,
    notes: payload.notes,
  };
};

export const deleteDeal = async (id: string) => {
  const { error } = await supabase.from("deals").delete().eq("id", id);
  if (error) throw error;
};

export const updateDealPositions = async (
  updates: { id: string; columnId: string; position: number }[]
) => {
  const results = await Promise.all(
    updates.map((u) =>
      supabase
        .from("deals")
        .update({ column_id: u.columnId, position: u.position })
        .eq("id", u.id)
    )
  );
  const error = results.find((r) => r.error)?.error;
  if (error) throw error;
};

// Notes
export const fetchNotes = async (): Promise<Note[]> => {
  const { data, error } = await supabase
    .from("notes")
    .select("id,deal_id,content,created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    dealId: row.deal_id,
    body: row.content,
    createdAt: row.created_at,
  }));
};

export const createNote = async (dealId: string, body: string): Promise<Note> => {
  const { data, error } = await supabase
    .from("notes")
    .insert({ deal_id: dealId, content: body })
    .select("id,deal_id,content,created_at")
    .single();
  if (error) throw error;

  return {
    id: data.id,
    dealId: data.deal_id,
    body: data.content,
    createdAt: data.created_at,
  };
};

export const updateNote = async (id: string, body: string): Promise<Note> => {
  const { data, error } = await supabase
    .from("notes")
    .update({ content: body })
    .eq("id", id)
    .select("id,deal_id,content,created_at")
    .single();
  if (error) throw error;

  return {
    id: data.id,
    dealId: data.deal_id,
    body: data.content,
    createdAt: data.created_at,
  };
};

export const deleteNote = async (id: string) => {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
};

// Reminders
export const fetchReminders = async (): Promise<Reminder[]> => {
  const { data, error } = await supabase
    .from("reminders")
    .select("id,deal_id,remind_at")
    .order("remind_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    dealId: row.deal_id,
    remindAt: row.remind_at,
  }));
};

export const createReminder = async (
  dealId: string,
  remindAt: string
): Promise<Reminder> => {
  const { data, error } = await supabase
    .from("reminders")
    .insert({ deal_id: dealId, remind_at: remindAt })
    .select("id,deal_id,remind_at")
    .single();
  if (error) throw error;

  return { id: data.id, dealId: data.deal_id, remindAt: data.remind_at };
};

export const updateReminder = async (
  id: string,
  remindAt: string
): Promise<Reminder> => {
  const { data, error } = await supabase
    .from("reminders")
    .update({ remind_at: remindAt })
    .eq("id", id)
    .select("id,deal_id,remind_at")
    .single();
  if (error) throw error;

  return { id: data.id, dealId: data.deal_id, remindAt: data.remind_at };
};

export const deleteReminder = async (id: string) => {
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) throw error;
};

export const upsertReminderForDeal = async (
  dealId: string,
  remindAt: string | null
): Promise<void> => {
  if (!remindAt) return;
  const { error } = await supabase
    .from("reminders")
    .upsert({ deal_id: dealId, remind_at: remindAt }, { onConflict: "deal_id" });
  if (error) throw error;
};

// Activity events
export const fetchActivityEvents = async (): Promise<ActivityEvent[]> => {
  const { data, error } = await supabase
    .from("activity_events")
    .select("id,type,deal_id,column_id,payload,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    dealId: row.deal_id ?? null,
    columnId: row.column_id ?? null,
    payload: row.payload ?? null,
    createdAt: row.created_at ?? null,
  }));
};

export const createActivityEvent = async (event: {
  type: string;
  dealId?: string | null;
  columnId?: string | null;
  payload?: string | null;
}) => {
  const { error } = await supabase.from("activity_events").insert({
    type: event.type,
    deal_id: event.dealId ?? null,
    column_id: event.columnId ?? null,
    payload: event.payload ?? null,
  });
  if (error) throw error;
};
