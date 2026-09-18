import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import Swal from 'sweetalert2';
import { Modulo } from '../models/Modulo';
import { ModuloViewModel } from '../models/ModuloViewModel';


@Component({
  selector: 'app-almacen-inventario-listado.component',
  templateUrl: './almacen-inventario-listado.component.html',
  styleUrls: ['./almacen-inventario-listado.component.scss']
})
export class AlmacenInventarioListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data:any[] = [] //tu modelo
  btnEliminarCargando: boolean;

  filtrador:any[] = [
    {codigo:"Almacén",nombre:"Almacén"},
    {codigo:"Tipo Inventario",nombre:"Tipo Inventario"}
  ] 
  loadingAlmacenes: boolean;
  almacenes: { codigo: any; nombre: any; }[];
  loadingInventarioTipo: boolean;
  inventarioTipos: { codigo: number; nombre: string; }[];


  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
   this.getData();
   this.getAlmacenes();
   this.getInventarioTipos();
  }
 
  
  selectedAlmacen=1;
  selectedTipoInventario=1;
  getData() {
    this.Cargando = true;
    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      { key: "Almacen", value: this.selectedAlmacen },
      { key: "TipoInventario", value: this.selectedTipoInventario }
  ]
    this.httpService.GetAllWithPagination<ModuloViewModel>(DataApi.AlmacenInventario, "GetAlmacenIventarioListado", "ID", this.paginaNumeroActual,
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
  almacenSeleccionado(event:ComboBox){
   this.getData();
  }

  tipoInventarioSeleccionado(event:ComboBox){
    this.getData();
   }
 
  getAlmacenes() {
    this.loadingAlmacenes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetAlmacenes", null).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almacenes = response.records.map(x => {
            return { "codigo": x.codigo, "nombre": x.nombre }
          });
        }
        this.loadingAlmacenes = false;
      }, error => {
        this.loadingAlmacenes = false;
        this.toastService.error("No se pudo obtener los almacenes", "Error conexion al servidor");
        setTimeout(() => {
          this.getAlmacenes()
        }, 1000);

      });
  }
  getInventarioTipos() {
    this.loadingInventarioTipo = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetInventarioTipos", null).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.inventarioTipos = response.records.map(x => {
            return { "codigo": x.codigo, "nombre": x.nombre }
          });
        }
        this.loadingInventarioTipo = false;
      }, error => {
        this.loadingInventarioTipo = false;
        this.toastService.error("No se pudo obtener los Inventarios Tipos", "Error conexion al servidor");
        setTimeout(() => {
          this.getAlmacenes()
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
  confirmarEliminacionDeModulo(id:number){
    Swal.fire({
      title: 'Estas seguro que quieres eliminar este modulo?',
      text: 'Luego de ser eliminado no se puedo desahacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'SI',
      cancelButtonText: 'NO'
    }).then((result) => {
      if (result.value) {
        this.eliminarModulo(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelado',
          'Se ha eliminado el modulo.)',
          'error'
        )
      }
    })
  }
  eliminarModulo(id:number) {
     let parametros = new Modulo();
     parametros.companiaId =Number(this.authService.tokenDecoded.primarygroupsid),
     parametros.id=id, 
    this.btnEliminarCargando = true;
    this.httpService.DoPostAny<any>(DataApi.Modulo,
      "EliminarModulo", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
         Swal.fire(
           'Confirmado',
           'Se ha eliminado el modulo correctamente.',
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
