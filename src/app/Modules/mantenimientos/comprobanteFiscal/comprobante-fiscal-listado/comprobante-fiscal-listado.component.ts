import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ComprobanteFiscal } from '../models/ComprobanteFiscal';
import { ComprobanteFiscalListadoViewModel } from '../models/ComprobanteFiscalListadoViewModel';

@Component({
  selector: 'app-comprobante-fiscal-listado',
  templateUrl: './comprobante-fiscal-listado.component.html',
  styleUrls: ['./comprobante-fiscal-listado.component.scss']
})
export class ComprobanteFiscalListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: ComprobanteFiscalListadoViewModel[] = [] //tu modelo
  estados: ComboBox[];
  loadingEstados: boolean;
  estadoSelected: number;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getComprobanteFiscalEstados();
  }
  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      { key: "estadoID", value: this.estadoSelected },
    ]

    this.httpService.GetAllWithPagination<ComprobanteFiscalListadoViewModel>(DataApi.ComprobanteFiscal,
      "GetComprobanteFiscalListado", "ID", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {

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



  getComprobanteFiscalEstados() {
    this.loadingEstados = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetComprobanteFiscalEstados", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.estados = response.records;

          if (this.estados && this.estados.length > 0) {
            this.estadoSelected = this.estados[0].codigo;
          }

          this.getData()
        }

        this.loadingEstados = false;

      }, error => {
        this.toastService.error("No se pudo obtener los estados.", "Error conexion al servidor");
        setTimeout(() => {
          this.getComprobanteFiscalEstados()
        }, 1000);

      });
  }




}
