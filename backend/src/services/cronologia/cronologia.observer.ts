// services/cronologia/cronologia.observer.ts

import { ObserverCronologia } from './observer-cronologia.interface';
import { Issue } from '../../models/Issue';
import { CronologiaService } from './cronologia.service';

export class CronologiaObserver implements ObserverCronologia {
  constructor(private cronologiaService: CronologiaService) {}

  async aggiorna(issue: Issue, descrizione: string, autoreId: number): Promise<void> {
    await this.cronologiaService.registraEvento(issue.id, descrizione, autoreId);
  }
}