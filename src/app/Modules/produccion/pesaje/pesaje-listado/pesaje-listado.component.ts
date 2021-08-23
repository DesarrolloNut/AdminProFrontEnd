import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ArticuloPesajeListadoViewModel } from '../models/ArticuloPesajeListadoViewModel';

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
  data: ArticuloPesajeListadoViewModel[] = [] //tu modelo
  almacenDefault: any;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    // this.getData()
    this.getAlmacenesUsuarioEnrroll();
  }

  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Almacen", value: this.almacenDefault }]

    this.httpService.GetAllWithPagination<ArticuloPesajeListadoViewModel>(DataApi.ArticuloPesaje, "GetArticuloPesajeListado", "ID", this.paginaNumeroActual,
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


  getAlmacenesUsuarioEnrroll() {

    let parametros: Parametro[] = [
      { key: "usuarioID", value: this.authService.tokenDecoded.nameid },
      { key: "ModuloKey", value: EstadosGeneralesKeyEnum.PRODUCCION },
    ]

    // this.loadingAlmacenesDesde = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuarioAlmacenesModulo", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          if (response.records.length > 0) {
            this.almacenDefault = response.records[0].codigo
            this.getData();
          }

        }
        // this.loadingAlmacenesDesde = false;
      }, error => {
        // this.loadingAlmacenesDesde = false;
        this.toastService.error("No se pudo obtener el almacen por default PRODUCCION", "Error conexion al servidor");

        setTimeout(() => {
          this.getAlmacenesUsuarioEnrroll();
        }, 1000);

      });
  }



}
