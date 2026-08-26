// services/cronologia/cronologia.observer.ts

import { ObserverCronologia, EventoIssue } from './observer-cronologia.interface';
import { CronologiaService } from './cronologia.service';

export class CronologiaObserver implements ObserverCronologia {
  constructor(private cronologiaService: CronologiaService) {}

  async aggiorna(evento: EventoIssue): Promise<void> {
    await this.cronologiaService.registraEvento(evento.issue.id, evento.descrizione, evento.autoreId);
  }
}