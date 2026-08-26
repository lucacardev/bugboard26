// services/cronologia/observer-cronologia.interface.ts

import { Issue } from '../../models/Issue';

/**
 * Interfaccia Observer
 * ConcreteObserver: CronologiaObserver.
 */

export interface ObserverCronologia {
  aggiorna(issue: Issue, descrizione: string, autoreId: number): Promise<void>;
}