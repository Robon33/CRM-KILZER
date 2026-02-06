import type { KanbanColumnData } from "../types/kanban";

export const kanbanColumnsMock: KanbanColumnData[] = [
  {
    id: "prospect",
    title: "Prospect",
    deals: [
      {
        id: "deal-1",
        title: "Nova Labs",
        clientName: "Camille B.",
        priority: "high",
        nextFollowUpDate: "2026-02-09",
        reminderAt: "2026-02-09T10:30",
        notes: "Equipe pilote a valider avant demo.",
      },
      {
        id: "deal-2",
        title: "Orion Tech",
        clientName: "Hugo L.",
        priority: "medium",
        nextFollowUpDate: null,
        reminderAt: null,
        notes: "Attente de budget Q2.",
      },
    ],
  },
  {
    id: "contact-etabli",
    title: "Contact etabli",
    deals: [
      {
        id: "deal-3",
        title: "Bluewave",
        clientName: "Sara M.",
        priority: "medium",
        nextFollowUpDate: "2026-02-11",
        reminderAt: "2026-02-11T09:00",
        notes: "Besoin de clarifier perimetre.",
      },
    ],
  },
  {
    id: "devis-envoye",
    title: "Devis envoye",
    deals: [
      {
        id: "deal-4",
        title: "Atelier Nord",
        clientName: "Yanis D.",
        priority: "high",
        nextFollowUpDate: "2026-02-08",
        reminderAt: "2026-02-08T16:00",
        notes: "Devis envoye, retour attendu.",
      },
    ],
  },
  {
    id: "relance",
    title: "Relance",
    deals: [
      {
        id: "deal-5",
        title: "Mistral Studio",
        clientName: "Lina P.",
        priority: "low",
        nextFollowUpDate: "2026-02-10",
        reminderAt: "2026-02-10T11:00",
        notes: "Relance douce par email.",
      },
    ],
  },
  {
    id: "gagne",
    title: "Gagne",
    deals: [
      {
        id: "deal-6",
        title: "Sienna Corp",
        clientName: "Alex R.",
        priority: "medium",
        nextFollowUpDate: null,
        reminderAt: null,
        notes: "Upsell potentiel Q3.",
      },
    ],
  },
  {
    id: "perdu",
    title: "Perdu",
    deals: [
      {
        id: "deal-7",
        title: "Helios Health",
        clientName: "Nina K.",
        priority: "low",
        nextFollowUpDate: null,
        reminderAt: null,
        notes: "Perdu, budget gelé.",
      },
    ],
  },
];
