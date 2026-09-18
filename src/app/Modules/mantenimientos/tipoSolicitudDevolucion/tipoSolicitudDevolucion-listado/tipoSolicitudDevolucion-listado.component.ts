import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import Swal from 'sweetalert2';
import { TipoSolicitudDevolucion } from '../models/TipoSolicitudDevolucion';


import { TipoSolicitudDevolucionViewModel } from '../models/TipoSolicitudDevolucionViewModel';


@Component({
  selector: 'app-tipoSolicitudDevolucion-listado.component',
  templateUrl: './tipoSolicitudDevolucion-listado.component.html',
  styleUrls: ['./tipoSolicitudDevolucion-listado.component.scss']
})
export class TipoSolicitudDevolucionListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data:TipoSolicitudDevolucionViewModel[] = [] //tu modelo
  btnEliminarCargando: boolean;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    public permissionsService: NgxPermissionsService,
  ) { }
  ngOnInit(): void {
   this.getData()
  }
  getData() {
    this.Cargando = true;
    let parametros: Parametro[] = [{ key: "search", value: this.Search }]
    this.httpService.GetAllWithPagination<TipoSolicitudDevolucionViewModel>(DataApi.TipoSolicitudDevolucion, "GetTipoSolicitudSolicitudDevolucion", "ID", this.paginaNumeroActual,
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
  confirmarTipoSolicitudDevolucion(id:number){
    Swal.fire({
      title: 'Estas seguro que quieres eliminar este registro?',
      text: 'Luego de ser eliminado no se puedo desahacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'SI',
      cancelButtonText: 'NO'
    }).then((result) => {
      if (result.value) {
        this.eliminarTipoSolicitudDevolucion(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelado',
          'Se ha eliminado el modulo.)',
          'error'
        )
      }
    })
  }
  eliminarTipoSolicitudDevolucion(id:number) {
     let parametros = new TipoSolicitudDevolucion();
     parametros.id=id, 
    this.btnEliminarCargando = true;
    this.httpService.DoPostAny<any>(DataApi.TipoSolicitudDevolucion,
      "Delete", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
         Swal.fire(
           'Confirmado',
           'Se ha eliminado el registro correctamente.',
           'success'
         )
          this.getData();
        }
        this.btnEliminarCargando = false;
      }, error => {
        this.btnEliminarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
}
