import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DualListComponent } from 'angular-dual-listbox';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Combustible } from '../../combustibles/models/Combustible';
import { ListaPrecio } from '../models/ListaPrecio';

@Component({
  selector: 'app-lista-precios-listado',
  templateUrl: './lista-precios-listado.component.html',
  styleUrls: ['./lista-precios-listado.component.scss']
})
export class ListaPreciosListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: ListaPrecio[] = [] //tu modelo

  // Dual List options 
  tab = 1;
  keepSorted = true;
  key: string;
  display: string;
  filter = true;
  source: Array<any>;
  confirmed: Array<any>;
  userAdd = '';
  disabled = false;

  sourceLeft = true;
  // format: any = DualListComponent.DEFAULT_FORMAT;
  format = {
    add: 'Agregar', remove: 'Remover', all: 'Todos', none: 'Ninguno',
    direction: DualListComponent.LTR, draggable: true, locale: 'da'
  };
  private sourceStations: Array<any>;

  private confirmedStations: Array<any>;


  private stations: Array<any> = [
    { key: 1, station: 'Antonito', state: 'CO' },
    { key: 2, station: 'Big Horn', state: 'NM' },
    { key: 3, station: 'Sublette', state: 'NM' },
    { key: 4, station: 'Toltec', state: 'NM' },
    { key: 5, station: 'Osier', state: 'CO' },
    { key: 6, station: 'Chama', state: 'NM' },
    { key: 7, station: 'Monero', state: 'NM' },
    { key: 8, station: 'Lumberton', state: 'NM' },
    { key: 9, station: 'Duice', state: 'NM' },
    { key: 10, station: 'Navajo', state: 'NM' },
    { key: 11, station: 'Juanita', state: 'CO' },
    { key: 12, station: 'Pagosa Jct', state: 'CO' },
    { key: 13, station: 'Carracha', state: 'CO' },
    { key: 14, station: 'Arboles', state: 'CO' },
    { key: 15, station: 'Solidad', state: 'CO' },
    { key: 16, station: 'Tiffany', state: 'CO' },
    { key: 17, station: 'La Boca', state: 'CO' },
    { key: 18, station: 'Ignacio', state: 'CO' },
    { key: 19, station: 'Oxford', state: 'CO' },
    { key: 20, station: 'Florida', state: 'CO' },
    { key: 21, station: 'Bocea', state: 'CO' },
    { key: 22, station: 'Carbon Jct', state: 'CO' },
    { key: 23, station: 'Durango', state: 'CO' },
    { key: 24, station: 'Home Ranch', state: 'CO' },
    { key: 25, station: 'Trimble Springs', state: 'CO' },
    { key: 26, station: 'Hermosa', state: 'CO' },
    { key: 27, station: 'Rockwood', state: 'CO' },
    { key: 28, station: 'Tacoma', state: 'CO' },
    { key: 29, station: 'Needleton', state: 'CO' },
    { key: 30, station: 'Elk Park', state: 'CO' },
    { key: 31, station: 'Silverton', state: 'CO' },
    { key: 32, station: 'Eureka', state: 'CO' }
  ];


  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getData()
    this.doReset();
  }

  doReset() {
    this.sourceStations = JSON.parse(JSON.stringify(this.stations));

    this.confirmedStations = new Array<any>();

    // Preconfirm some items.
    this.confirmedStations.push(this.stations[31]);
    this.confirmedStations.push(this.stations[30]);
    this.confirmedStations.push(this.stations[29]);

    this.useStations();
  }


  private useStations() {
    this.key = 'key';
    this.display = 'station'; // [ 'station', 'state' ];
    this.keepSorted = true;
    this.source = this.sourceStations;
    this.confirmed = this.confirmedStations;
  }

  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

    this.httpService.GetAllWithPagination<ListaPrecio>(DataApi.ListaPrecio, "GetListaPrecioListado", "ID", this.paginaNumeroActual,
      this.paginaSize, true, parametros).subscribe(x => {

        if (x.ok) {
          this.data = x.records;
          this.asignarPagination(x);
        } else {
          this.toastService.error(x.errores[0]);
          console.error(x.errores[0]);
        }
        this.Cargando = false;
      }, error => {
        console.error(error);
        this.toastService.error("Error conexion al servidor");
        this.Cargando = false;
      });

  }


  asignarPagination(x: ResponseContenido<any>) {

    if (x.pagina != null) {
      this.totalPaginas = x.pagina.totalPaginas == null ? 0 : x.pagina.totalPaginas;
      this.paginaTotalRecords = x.pagina.totalRecords == null ? 0 : x.pagina.totalRecords;
      this.paginaSize = x.pagina.paginaSize == null ? 0 : x.pagina.paginaSize;
    } else {
      this.totalPaginas = 0;
      this.paginaTotalRecords = 0;
      this.paginaSize = 0;
    }

  }


  openModal(content) {
    this.modalService.open(content, { size: 'lg' });
  }

}
