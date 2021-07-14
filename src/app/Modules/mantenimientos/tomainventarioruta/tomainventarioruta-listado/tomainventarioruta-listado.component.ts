import { FrecuenciaVisita } from './../../clientes/models/FrecuenciaVisita';
import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { RollUsuario } from 'src/app/shared/enums/RollUsuario';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { TomaInventarioRuta } from '../models/TomaInventarioRuta';

@Component({
  selector: 'app-tomainventario-listado',
  templateUrl: './tomainventarioruta-listado.component.html',
  styleUrls: ['./tomainventarioruta-listado.component.scss']
})
export class TomainventarioRutaListadoComponent implements OnInit {
// COPIAR AL CREAR UN LISTADO NUEVO
Search: string = "";
paginaNumeroActual = 1;
Cargando: boolean = false;
CargandoBar: boolean = false;
totalPaginas: number = 0;
paginaSize: number = 5;
paginaTotalRecords: number = 0;
data: TomaInventarioRuta[] = [] //tu modelo
btnGuardarCargando: boolean = false;
loadingUsuarios: boolean;
loadingFrecuenciaVisita: boolean;
Usuarios: ComboBox[];
Dias: ComboBox[] = [
  {codigo: 1, nombre: 'Lunes', grupo:'', grupoID:''},
  {codigo: 2, nombre: 'Martes', grupo:'', grupoID:''},
  {codigo: 3, nombre: 'Miercoles', grupo:'', grupoID:''},
  {codigo: 4, nombre: 'Jueves', grupo:'', grupoID:''},
  {codigo: 5, nombre: 'Viernes', grupo:'', grupoID:''},
  {codigo: 6, nombre: 'Sabado', grupo:'', grupoID:''},
  {codigo: 7, nombre: 'Domingo', grupo:'', grupoID:''},
];
FrecuenciaVisita: FrecuenciaVisita[];
constructor(private toastService: ToastrService,
  private httpService: BackendService,
  public permissionsService: NgxPermissionsService,
) { }


ngOnInit(): void {
  this.getData();
  this.getUsuariobyRolID();
}
getData() {
  this.Cargando = true;

  let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

  this.httpService.GetAllWithPagination<TomaInventarioRuta>(DataApi.TomaInventarioRuta, "GetTomaInventarioRutaListado", "zona", this.paginaNumeroActual,

    this.paginaSize, true, parametros).subscribe(x => {

      if (x.ok) {
        x.records.forEach(x => x.editarUsuarioConfirmado = true);
        this.data = x.records;
        // console.log(x);
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



onChangeEdit(value:TomaInventarioRuta){
  value.editarUsuarioConfirmado = !value.editarUsuarioConfirmado;
  value.cancelarUsuarioConfirmado = !value.cancelarUsuarioConfirmado;
  value.cambioUsuarioConfirmado = value.editarUsuarioConfirmado ? false : true;
}


SaveChanges(value:TomaInventarioRuta) {


  this.btnGuardarCargando = true;
  this.httpService.DoPostAny<any>(DataApi.TomaInventarioRuta, "Update", value).subscribe(x => {

      if (x.ok) {
        this.getData();
      } else {
        this.toastService.error(x.errores[0]);
        console.error(x.errores[0]);
      }
      this.btnGuardarCargando = false;
    }, error => {
      console.error(error);
      this.toastService.error("Error conexion al servidor");
      this.btnGuardarCargando = false;
    });

  this.httpService.DoPostAny<any>(DataApi.TomaInventarioRuta, "InsertOrUpdateFrecuenciaVisita", value).subscribe(x => {

      if (x.ok) {
        this.getData();
      } else {
        this.toastService.error(x.errores[0]);
        console.error(x.errores[0]);
      }
    }, error => {
      console.error(error);
      this.toastService.error("Error conexion al servidor");
    });
    this.onChangeEdit(value);





}

getUsuariobyRolID() {
  this.loadingUsuarios = true;
  let parametro: Parametro[] = [{ key: "RollID", value: RollUsuario.RECOGEDOR }];
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetUsuarioPorRollComboBox", parametro).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.Usuarios = response.records;
      }
      this.loadingUsuarios = false;
    }, error => {
      this.loadingUsuarios = false;
      this.toastService.error("No se pudo obtener los supervisores", "Error conexion al servidor");

      setTimeout(() => {
        this.getUsuariobyRolID()
      }, 1000);

    });
}

getFrecuenciaVisita(value:TomaInventarioRuta) {
  this.loadingFrecuenciaVisita = true;
  this.httpService.DoPostAny<FrecuenciaVisita>(DataApi.TomaInventarioRuta,
    "getClienteFrecuenciaVisitaEnrrollByID", value.clienteId).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.FrecuenciaVisita = response.records;
      }
      this.loadingFrecuenciaVisita = false;
    }, error => {
      this.loadingFrecuenciaVisita = false;
      this.toastService.error("No se pudo obtener los supervisores", "Error conexion al servidor");

      setTimeout(() => {
        this.getUsuariobyRolID()
      }, 1000);

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

}
