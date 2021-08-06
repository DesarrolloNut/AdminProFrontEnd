import { OrdenFabricacion } from './../models/OrdenFabricacion';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { OrdenFabricacionVista } from '../models/OrdenFabricacionVista';
import { ListaMaterialesHeader } from '../models/ListaMaterialesHeader';
import { OrdenFabricacionDetalle } from '../models/OrdenFabricacionDetalle';
import { ActivatedRoute, Router } from '@angular/router';

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
  CantidadPlanificada: number = 1;

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

  loadingArticulosExtras: boolean;
  articulosExtras: OrdenFabricacionVista[];
  ofheader: ListaMaterialesHeader = new ListaMaterialesHeader();
  ordenfabricacion: OrdenFabricacion = new OrdenFabricacion();
  ordenfabricaciondetalle: OrdenFabricacionDetalle = new OrdenFabricacionDetalle();
  IsNewData:boolean = true;
  IsClose: boolean = false;

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private router: Router,
    private route: ActivatedRoute,
    )
    //
    // private renderer: Renderer2
 { }

  ngOnInit(): void {
    this.getAlmacenes()
    this.getOrdenFabricacionTipo();
    this.getEstadosAutorizacion();

    let id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.IsNewData = false;
      this.getOrdenFabricacion(id);
}
    else{
      this.IsNewData = true;
      // this.getArticuloByCodigoReferencia(id.toString());
    }
  }


  onSubmit() {
    this.guardar()
  }

  OnlyInterger(){
    this.ofheader.cantidadPlanificada = this.ofheader.cantidadPlanificada > 0 ? parseInt(this.ofheader.cantidadPlanificada.toString()) : this.ofheader.cantidadPlanificada ;
  }

  guardar() {

    let OrdenFabricacion: OrdenFabricacion =  {
      almacenId: this.ofheader.almacenId,
      articuloId: this.articulo.id,
      ordenFabricacionTipoId: this.ofheader.tipoId,
      cantidad: this.ofheader.cantidadPlanificada,
      costoReal: 0,
      cantidadProducida: this.ofheader.cantidadPlanificada,
      estadoId: this.ofheader.estadoId,
      codigoReferencia:"",
      fechaCierre: new Date(),
      fechaCreacion: new Date(),
      fechaInicio: new Date(),
      id: this.ofheader.id
    };

    let OrdenFabricacionDetalle: Array<OrdenFabricacionDetalle> = [];

    this.articulosExtras.forEach(x => {
      let ofd: OrdenFabricacionDetalle = {
        almacenId: x.almacenId,
        articuloId: x.articuloId,
        cantidadBase: x.cantidadBase,
        cantidadRequerida: (x.cantidadBase * OrdenFabricacion.cantidad),
        consumido: 0,
        merma: 0,
        disponible: x.disponible,
        metodoEmisionId: x.metodoEmision == 'M' ? 1 : 2,
        unidadMedida: x.unidadMedida,
        costoArticulo: x.costoArticulo,
        id: x.id,
        ordenFabricacionId: 0

      };
      OrdenFabricacionDetalle.push(ofd);
    });


    // console.table(OrdenFabricacion);
    // console.table(OrdenFabricacionDetalle);

    let ActionName = this.IsNewData ? "RegistrarOrdenFabricacionAndOrdenFabricacionDetalleViewModel" : "UpdateOrdenFabricacionAndOrdenFabricacionDetalleViewModel";

    this.httpService.DoPostAny<OrdenFabricacion>(DataApi.OrdenFabricacion,
      ActionName, { OrdenFabricacion: OrdenFabricacion, OrdenFabricacionDetalles: OrdenFabricacionDetalle }).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response.ok) {
            // let record = response.records[0]
            // this.articulo = record;
            // this.getArticulosDeMateriales();
            this.toastService.success("Realizado", "OK");
            this.router.navigateByUrl('/produccion/ordenfabricacion');
          }
          else {
            // this.articulo = null;
          }
          this.searching = false;
        }

      }, error => {
        this.searching = false;
        this.toastService.error("Error conexion al servidor");
      });


  }





  // private CreateFormDetalle() {

  //   this.FormDetails = this.formBuilder.group({
  //     costocomponentearticuloreal: [0, [Validators.required]],
  //     costocomponenterecursoreal: [0, [Validators.required]],
  //     costoadicionalreal: [0, [Validators.required]],
  //     costoproductoreal: [0, [Validators.required]],
  //     costerealsubproductos: [0, [Validators.required]],
  //     desviaciontotal: [0, [Validators.required]],
  //     cantidadplanificada: [null, [Validators.required]],
  //     cantidadcompletada: [null, [Validators.required]],
  //     cantidadrechazada: [null, [Validators.required]],
  //     fechafinalizacion: [null, [Validators.required]],
  //     fechacierrereal: [null, [Validators.required]],
  //     vencido: [null, [Validators.required]],
  //     tiempoproducciontotal: [null, [Validators.required]],
  //     tiempoadicionaltotal: [null, [Validators.required]],
  //     tiempoejecuciontotal: [null, [Validators.required]],
  //     totaldiassolicitados: [null, [Validators.required]],
  //     totaldiasespera: [null, [Validators.required]],
  //     diastotales: [null, [Validators.required]],
  //   },
  //     {
  //       validator: null
  //     });

  // }



  onSearchChange() {

    if (this.search && this.search.length > 3) {
      this.IsNewData = true;
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

  getArticuloById(ArticuloID: number) {
    this.searching = true;
    this.httpService.DoPostAny<Articulo>(DataApi.Articulo,
      "GetArticuloByID", ArticuloID ).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.articulo = record;

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
    this.loadingArticulosExtras = true;

    this.httpService.DoPostAny<OrdenFabricacionVista>(DataApi.OrdenFabricacion,
      "GetOrdenFabricacionListadoMateriales", {CodigoRefencia:this.articulo.codigoReferencia}).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articulosExtras = response.records;
          console.log()
          this.ofheader.almacenId = response.records[0].almacenId;
          // this.FormHeader.setValue(response.records);
          //this.formatArticulosExtras()
        }
        this.loadingArticulosExtras = false;
      }, error => {
        this.loadingArticulosExtras = false;
        this.toastService.error("No se pudo obtener los articulos extras", "Error conexion al servidor");

        setTimeout(() => {
          this.getArticulosDeMateriales();
        }, 1000);
      });
  }


   getOrdenFabricacion(id:number) {
    this.loadingArticulosExtras = true;

    this.httpService.DoPostAny<OrdenFabricacion>(DataApi.OrdenFabricacion,
      "GetOrdenFabricacionByID", id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          let estado = response.records[0].estadoId;
          if(estado == 3){
            this.IsClose = true;
          }
          this.getArticuloById(response.records[0].articuloId);
          this.ofheader.tipoId = response.records[0].ordenFabricacionTipoId;
          this.ofheader.estadoId = response.records[0].estadoId;
          this.ofheader.cantidadPlanificada = response.records[0].cantidad;
          this.ofheader.almacenId = response.records[0].almacenId;
          this.ofheader.fechaInicio = response.records[0].fechaInicio;
          this.ofheader.fechaCierre = response.records[0].fechaCierre;
          this.ofheader.id = response.records[0].id;
          this.getOrdenFabricacionDetalle(response.records[0].id);
          this.ordenfabricacion = response.records[0];
          this.getEstadosAutorizacion();
        }
        this.loadingArticulosExtras = false;
      }, error => {
        this.loadingArticulosExtras = false;
        this.toastService.error("No se pudo obtener los articulos extras", "Error conexion al servidor");

        setTimeout(() => {
          //this.getOrdenFabricacion();
        }, 1000);
      });
  }


  getOrdenFabricacionDetalle(ordenFabricacionId: number) {
    this.loadingArticulosExtras = true;

    this.httpService.DoPostAny<OrdenFabricacionVista>(DataApi.OrdenFabricacionDetalle,
      "GetOrdenFabricacionDetalleVistaByID", ordenFabricacionId).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
         this.articulosExtras = response.records;
         //console.log(response.records)
        }
        this.loadingArticulosExtras = false;
      }, error => {
        this.loadingArticulosExtras = false;
        this.toastService.error("No se pudo obtener los articulos extras", "Error conexion al servidor");

        setTimeout(() => {
          //this.getOrdenFabricacionDetalle();
        }, 1000);
      });
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
        }
      }, error => {
        this.toastService.error("No se pudo obtener los estados.", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadosAutorizacion()
        }, 1000);

      });
  }






}
