import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ArticuloPesosExtrasRenderViewModel } from '../../pesaje/models/ArticuloPesosExtrasRenderViewModel';
import { ArticuloPesosExtrasViewModel } from '../../pesaje/models/ArticuloPesosExtrasViewModel copy';

@Component({
  selector: 'app-ordenfabricacion-formulario',
  templateUrl: './ordenfabricacion-formulario.component.html',
  styleUrls: ['./ordenfabricacion-formulario.component.scss']
})
export class OrdenfabricacionFormularioComponent implements OnInit {

  articulo: Articulo;
  almacenID: number;
  cargando: boolean;
  search: string;
  searching: boolean;
  CantidadPlanificada: number = 0;



  loadingAlmacenes: boolean;
  almecenes: any[];
  fechaActual: Date;
  fechaVencimiento: Date;
  btnGuardarCargando: boolean;

  loadingTipo: boolean;
  Tipos: ComboBox[];
  TipoId: number = 1;

  loadingEstado: boolean;
  estadosAutorizacion: ComboBox[];
  EstadoId: number = 1;


  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private router: Router
    // private renderer: Renderer2
    ) { }

  ngOnInit(): void {

    this.getAlmacenes()
    this.getOrdenFabricacionTipo();
    this.getEstadosAutorizacion();
  }

  onSubmit() {
    this.guardar()
  }

  guardar() {

  }



  onSearchChange() {

    if (this.search && this.search.length > 3) {

      this.getArticuloByCodigoReferencia(this.search)
    } else {
      this.articulo = null;
    }

  }

  onClearSearch() {
    this.search = ""
    this.onSearchChange()
  }


  getArticuloByCodigoReferencia(codigoRefencia: string) {
    this.searching = true;
    this.httpService.DoPostAny<Articulo>(DataApi.Articulo,
      "GetArticuloByCodigoReferencia", { codigoRefencia }).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.articulo = record;
            this.getArticulosDeMateriales();
          }
          else {
            this.articulo = null;
          }
          this.searching = false;
        }

      }, error => {
        this.searching = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


   getArticulosDeMateriales() {
  //   this.loadingArticulosExtras = true;
  //   this.httpService.DoPost<ArticuloPesosExtrasViewModel>(DataApi.Articulo,
  //     "GetArticulosDePesosExtras", null).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         this.articulosExtras = response.records;
  //         this.formatArticulosExtras()
  //       }
  //       this.loadingArticulosExtras = false;
  //     }, error => {
  //       this.loadingArticulosExtras = false;
  //       this.toastService.error("No se pudo obtener los articulos extras", "Error conexion al servidor");

  //       setTimeout(() => {
  //         this.getArticulosDePesosExtras();
  //       }, 1000);
  //     });
  }




  getAlmacenes() {
    this.loadingAlmacenes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetAlmacenes", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almecenes = response.records;
        }
        this.loadingAlmacenes = false;
      }, error => {
        this.loadingAlmacenes = false;
        this.toastService.error("No se pudo obtener los almacenes", "Error conexion al servidor");

        setTimeout(() => {
          this.getAlmacenes();
        }, 1000);

      });
  }

  getOrdenFabricacionTipo() {
    this.loadingTipo = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTipoOrdenFabricacionComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.Tipos = response.records;
        }
        this.loadingTipo = false;
      }, error => {
        this.loadingTipo = false;
        this.toastService.error("No se pudo obtener las compañias", "Error conexion al servidor");

        setTimeout(() => {
          this.getOrdenFabricacionTipo()
        }, 1000);

      });
  }

  getEstadosAutorizacion() {
    let parametros: Parametro[] = [{
      key: "NameKey",
      value: EstadosGeneralesKeyEnum.ORDENFABRICACION
    }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadoForKeyComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.estadosAutorizacion = response.records;
          // this.estadoIDAutorizacionDefault = response.records[0].codigo;
          // this.getSiguienteEstado()//almacena en una variable el siguiente estado
          // this.getAnteriorEstadoAutorizacion()//almacena en una variable el anterior estado
          // this.getData()
        }
      }, error => {
        this.toastService.error("No se pudo obtener los estados.", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadosAutorizacion()
        }, 1000);

      });
  }




}
