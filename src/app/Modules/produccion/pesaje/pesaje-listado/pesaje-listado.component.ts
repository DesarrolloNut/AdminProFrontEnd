import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pesaje-listado',
  templateUrl: './pesaje-listado.component.html',
  styleUrls: ['./pesaje-listado.component.scss']
})
export class PesajeListadoComponent implements OnInit {


  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: any[] = [] //tu modelo

  constructor() { }

  ngOnInit(): void {
  }
  getData() {

  }
}
