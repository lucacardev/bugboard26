// services/cronologia/observer-cronologia.interface.ts

import { Issue, StatoIssue } from '../../models/Issue';

export interface EventoIssue {
  issue: Issue;
  descrizione: string;
  autoreId: number;
  statoPrecedente?: StatoIssue; // presente solo per eventi di cambio-stato
}

/**
 * Interfaccia Observer (Lecture 19A, Design Patterns — Observer, Behavioral).
 * ConcreteObserver: CronologiaObserver, NotificationObserver.
 */
export interface ObserverCronologia {
  aggiorna(evento: EventoIssue): Promise<void>;
}