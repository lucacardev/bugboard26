import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  imports: [],
  templateUrl: './paginator.html',
  styleUrl: './paginator.scss',
})
export class Paginator {
  paginaCorrente = input.required<number>();
  totalePagine = input.required<number>();
  cambiaPagina = output<number>();

  vai(pagina: number): void {
    if (pagina < 1 || pagina > this.totalePagine()) return;
    this.cambiaPagina.emit(pagina);
  }
}