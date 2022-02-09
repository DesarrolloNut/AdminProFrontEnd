import { OrdenFabricacionEstadoEnum, OrdenFabricacionTipoEnum } from './../models/OrdenFabricacionEstadoEnum';
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
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ArticuloDeReproceso } from '../models/ArticuloReproceso';
import { Configuraciones } from 'src/app/shared/enums/Configuraciones';

@Component({
  selector: 'app-ordenfabricacion-formulario',
  templateUrl: './ordenfabricacion-formulario.component.html',
  styleUrls: ['./ordenfabricacion-formulario.component.scss']
})
export class OrdenfabricacionFormularioComponent implements OnInit {

  articulo: Articulo;
  articulosDeReproceso: Array<ArticuloDeReproceso> = [];
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
  articulosExtras: OrdenFabricacionVista[] = [];
  ofheader: ListaMaterialesHeader = new ListaMaterialesHeader();
  ordenfabricacion: OrdenFabricacion = new OrdenFabricacion();
  ordenfabricaciondetalle: OrdenFabricacionDetalle = new OrdenFabricacionDetalle();
  IsNewData:boolean = true;
  estadoAutorizacionUsuario: number = 0;
  ORDENFABRICACION_CONSUMO_REPROCESO: number = 0;
  articuloMaterial: Articulo;
  articulosDeCambios: Array<ArticuloDeReproceso> = [];
  cantidadArticuloDeCambio: number = 0;
  selectArticuloOriginal: OrdenFabricacionVista;
  articulosDeCambiosSelect: ArticuloDeReproceso;
  MostrarBtnReproceso: boolean = false;
  // ValidOrden: OrdenFabricacionEstadoEnum;

  public get ValidOrden(): typeof OrdenFabricacionEstadoEnum {
    return OrdenFabricacionEstadoEnum;
  }

  public get ValidTipoOrden(): typeof OrdenFabricacionTipoEnum {
    return OrdenFabricacionTipoEnum;
  }

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private router: Router,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    )
    //
    // private renderer: Renderer2
 { }

  ngOnInit(): void {
    this.getAlmacenes()
    this.getOrdenFabricacionTipo();
    this.getEstadosAutorizacion();
    this.getEstadoAutorizacionUsuario();
    this. getOrdenFabArticuloReprocesoCantidadBase();
    // this.getArticulosDeCambio(80);


    let id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.IsNewData = false;
      this.getOrdenFabricacion(id);
}else{
      this.IsNewData = true;
      // this.ofheader.estadoId = this.estadoAutorizacionUsuario;
    }


  }


  onSubmit() {


    if (this.ofheader.cantidadPlanificada <= 0) {
      this.toastService.warning("No digitado la cantidad planificada disponible.");
      return;
    }

    if (this.articulosExtras.length == 0) {
      this.toastService.warning("No se puede crear orden de fabricacion sin materiales.");
      return;
    }


    this.guardar()
  }

  OnlyInterger(){
    this.ofheader.cantidadPlanificada = this.ofheader.cantidadPlanificada > 0 ? parseInt(this.ofheader.cantidadPlanificada.toString()) : 1 ;
  }

  guardar() {


    let OrdenFabricacion: OrdenFabricacion =  {
      almacenId: this.ofheader.almacenId,
      articuloId: this.articulo.id,
      ordenFabricacionTipoId: this.ofheader.tipoId,
      cantidad: this.ofheader.cantidadPlanificada,
      costoReal: 0,
      cantidadProducida: 0,
      estadoId: this.ofheader.estadoId,
      estadoERPExternoId: 0,
      codigoReferencia:"",
      lote: "",
      batch: 0,
      turno: 0,
      fechaCierre: new Date(),
      fechaCreacion: new Date(),
      fechaInicio: new Date(),
      id: this.ofheader.id,
      usuarioId: parseInt(this.authService.tokenDecoded.nameid)
    };

    let OrdenFabricacionDetalle: Array<OrdenFabricacionDetalle> = [];

    this.articulosExtras.forEach(x => {
      let ofd: OrdenFabricacionDetalle = {
        almacenId: x.almacenId,
        articuloId: x.articuloId,
        cantidadBase: x.cantidadBase,
        cantidadRequerida: (x.cantidadBase * OrdenFabricacion.cantidad),
        consumido: 0,
        lote: "",
        merma: 0,
        disponible: x.disponible,
        metodoEmisionId: x.metodoEmision == 'M' ? 1 : 2,
        unidadMedida: x.unidadMedida,
        costoArticulo: x.costoArticulo,
        id: x.id,
        ordenFabricacionId: 0,
        estadoId: 0

      };
      OrdenFabricacionDetalle.push(ofd);
    });


    // console.table(OrdenFabricacion);
    // console.table(OrdenFabricacionDetalle);

    let ActionName = this.IsNewData ? "RegistrarOrdenFabricacionAndOrdenFabricacionDetalleViewModel" : "UpdateOrdenFabricacionAndOrdenFabricacionDetalleViewModel";

    this.btnGuardarCargando = true;

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
          this.btnGuardarCargando = false;
        }

      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });


  }

  onSubmitReproceso() {

    let cantidad = this.articulosDeReproceso.filter(x => x.isSelect == true).length;
    if (cantidad > 3) {
      this.toastService.warning("Solo puede selecionar 3 maximo.");
      return;
    }


  this.onSaveReproceso();
  }


  async onSaveReproceso() {

    let cantidadRPC = this.articulosExtras.filter(x => x.isRPC == true).length;
    if(cantidadRPC == 3){
      this.toastService.warning("Ha excedido el limite de agregar articulo.");
      return;
    }

    this.btnGuardarCargando = true;
    let ArtRep = this.articulosDeReproceso.filter(x => x.isSelect == true);
    let art = this.articulosExtras[0];
      let listaMaterialRPC:Array<OrdenFabricacionVista> = [];

    for (const key in ArtRep) {
        const item = ArtRep[key];

        let material: OrdenFabricacionVista = new OrdenFabricacionVista();
        material.codigoReferencia = item.codigoReferencia;
        material.articulo = item.codigoReferencia;
        material.articuloId = item.id;
        material.nombre = item.nombre;
        material.cantidadBase = this.ORDENFABRICACION_CONSUMO_REPROCESO;
        material.cantidadPlanificada = art.cantidadPlanificada;
        material.metodoEmision = "M"
        material.unidadMedida = item.unidadMedida;
        material.almacenCodigoReferencia = art.almacenCodigoReferencia;
        material.almacenId = art.almacenId;
        material.disponible = item.balance;
        material.isRPC = true;

       listaMaterialRPC.push(material)

    }


    if(listaMaterialRPC.length > 0){

      var props = ['articulo', 'nombre'];
      let articulosEX = this.articulosExtras;

      var result = listaMaterialRPC.filter(function(o1){
        // filter out (!) items in result2
        return !articulosEX.some(function(o2){
            return o1.articulo === o2.articulo;          // assumes unique id
        });
    });

    //   var result = listaMaterialRPC.filter(function(o1){
    //     // filter out (!) items in result2
    //     return !articulosEX.some(function(o2){
    //         return o1.articulo === o2.articulo;          // assumes unique id
    //     });
    // }).map(function(o){
    //     // use reduce to make objects with only the required properties
    //     // and map to apply this to the filtered array as a whole
    //     return props.reduce(function(newo, name){
    //         newo[name] = o[name];
    //         return newo;
    //     }, {});
    // });


      for (const key in result) {
          const element = result[key];
          this.articulosExtras.push(element);

      }

    }




    this.btnGuardarCargando = false;
  }


  async onSaveArticuloDeCambio() {

    this.btnGuardarCargando = true;
    try {
      let ArtCam = this.articulosDeCambiosSelect;
      if(ArtCam != null){
        let ArtOrig = this.selectArticuloOriginal;
        let Balance =  await this.getArticuloBalance(ArtCam.codigoReferencia, ArtOrig.almacenCodigoReferencia);

        // Remover el original del array
        const index = this.articulosExtras.indexOf(ArtOrig);
        this.articulosExtras.splice(index, 1);

        // Remplazar Informacion
        ArtOrig.articuloId = ArtCam.id;
        ArtOrig.articulo = ArtCam.codigoReferencia;
        ArtOrig.unidadMedida = ArtCam.unidadMedida;
        ArtOrig.nombre = ArtCam.nombre;
        ArtOrig.disponible = Balance;

        // agregar nuevo articulo
        this.articulosExtras.unshift(ArtOrig);
      }
      this.modalService.dismissAll();
      this.toastService.success("OK");
    } catch (error) {

    }




    this.btnGuardarCargando = false;
  }






  openModal(content) {
    this.getArticulosDeReproceso();
    // this.getOrdenFabricacion(modal.id);
    // this.selectOrden = modal;
    this.modalService.open(content, {
      windowClass: "myCustomModalClass",
      backdrop: "static",
    });
  }


  openModalArticuloCambio(content, model:OrdenFabricacionVista) {
    this.getArticulosDeCambio(model.articuloId);
    this.selectArticuloOriginal = model;
    this.modalService.open(content, {
      size: 'lg',
      // windowClass: "myCustomModalClass",
      backdrop: "static",
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
      // this.ofheader.estadoId = this.estadoAutorizacionUsuario;
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
            this.OnChangeMostrarBtnReproceso();
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

  getArticuloMaterialByCodigoReferencia(codigoRefencia: string) {
    this.searching = true;
    this.httpService.DoPostAny<Articulo>(DataApi.Articulo,
      "GetArticuloByCodigoReferencia", { codigoRefencia }).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.articuloMaterial = record;
          }
          else {
            this.articuloMaterial = null;
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
            this.OnChangeMostrarBtnReproceso();
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

  getArticulosDeReproceso() {
    this.searching = true;
    this.httpService.DoPostAny<Articulo>(DataApi.Articulo,
      "GetArticulosDeReproceso", {} ).subscribe(async response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let art = this.articulosExtras[0];
            response.records.forEach(async x => {
              let item:ArticuloDeReproceso = new ArticuloDeReproceso();
              item.id = x.id
              item.codigoReferencia = x.codigoReferencia;
              item.nombre = x.nombre;
              item.unidadMedida = x.unidadMedida;
              item.almacenId = art.almacenId;
              item.almacencodigoReferencia = art.almacenCodigoReferencia;
              item.balance = await this.getArticuloBalance(x.codigoReferencia, art.almacenCodigoReferencia);
              this.articulosDeReproceso.push(item);
            });

            // this.articulosDeReproceso.forEach(async x => {
            //   x.almacenId = art.almacenId;
            //   x.almacencodigoReferencia = art.almacenCodigoReferencia;
            //   x.balance = await this.getArticuloBalance(x.codigoReferencia, art.almacenCodigoReferencia);
            // });

            // let Balance =  await this.getArticuloBalance(item.codigoReferencia, element.almacenCodigoReferencia);
          }
          else {
          }
          this.searching = false;
        }

      }, error => {
        this.searching = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getArticulosDeCambio(ArticuloId:number) {
    this.articulosDeCambios = [];
    this.searching = true;
    this.httpService.DoPostAny<Articulo>(DataApi.Articulo,
      "GetArticulosDeCambios", ArticuloId ).subscribe(async response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            response.records.forEach(x => {
              let item:ArticuloDeReproceso = new ArticuloDeReproceso();
              item.id = x.id
              item.codigoReferencia = x.codigoReferencia;
              item.nombre = x.nombre;
              item.unidadMedida = x.unidadMedida;

              this.articulosDeCambios.push(item);
            });
            this.cantidadArticuloDeCambio = response.records.length;
          }
          else {
          }
          this.searching = false;
        }

      }, error => {
        this.searching = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  onDeleteItem(model:OrdenFabricacionVista){

    // let item = this.articulosExtras.findIndex(x => x.articulo === model.articulo);
    const index = this.articulosExtras.indexOf(model);

    if (index > -1) {
      this.articulosExtras.splice(index, 1);
    }

  }


   getArticulosDeMateriales() {
    this.loadingArticulosExtras = true;
    this.articulosExtras = [];
    this.httpService.DoPostAny<OrdenFabricacionVista>(DataApi.OrdenFabricacion,
      "GetOrdenFabricacionListadoMateriales", {CodigoRefencia:this.articulo.codigoReferencia}).subscribe(async response => {
          
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          if(response.records.length > 0){
            this.articulosExtras = response.records;
            for (const key in this.articulosExtras) {
              let element = this.articulosExtras[key];
              let Balance =  await this.getArticuloBalance(element.articulo, element.almacenCodigoReferencia);
               element.disponible = Balance;
            }
            // console.log(response.records);
            this.ofheader.almacenId = response.records[0].almacenId;
            // this.FormHeader.setValue(response.records);
            //this.formatArticulosExtras()
          }else{
            this.toastService.info("No se pudo obtener los Materiales", "Lista de materiales");
          }

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

  async getArticuloBalance(codigoArticulo:string, codigoAlmacen: string): Promise<number> {

    var Balance = null;
    var response = await this.httpService.DoPostAny<any>(DataApi.OrdenFabricacion,
      "GetArticuloBalance", {Codigo1:codigoArticulo, Codigo2:codigoAlmacen}).toPromise();

        if(response.ok && response.records.length > 0){
          Balance =  response.records[0];
        }

      return Balance;
  }


   getOrdenFabricacion(id:number) {
    this.loadingArticulosExtras = true;

    this.httpService.DoPostAny<OrdenFabricacion>(DataApi.OrdenFabricacion,
      "GetOrdenFabricacionByID", id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          let estado = response.records[0].estadoId;
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

  getEstadoAutorizacionUsuario() {
    let parametro = {
      "UsuarioID": Number(this.authService.tokenDecoded.nameid),
      "KeynameModule": EstadosGeneralesKeyEnum.ORDENFABRICACION,
    }

    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "GetEstadoAutorizacionUsuario", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.estadoAutorizacionUsuario = response.valores[0];
          this.getEstadosAutorizacion()
        }
      }, error => {
        this.toastService.error("No se pudo obtener el estado de autorización del usuario", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadoAutorizacionUsuario()
        }, 1000);

      });

  }

  getOrdenFabArticuloReprocesoCantidadBase() {
    this.httpService.DoPostAny<any>(DataApi.Configuracion,
      "GetConfiguracionValor", Number(Configuraciones.ORDENFABRICACION_CONSUMO_REPROCESO)).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          if (response.records.length == 0) {
            this.toastService.error("No hay ORDENFABRICACION_CONSUMO_REPROCESO configurado");
            console.error("No hay ORDENFABRICACION_CONSUMO_REPROCESO configurado")
          } else {
            this.ORDENFABRICACION_CONSUMO_REPROCESO = Number(response.records[0]);
          }

        }
      }, error => {
        this.toastService.error("No se pudo obtener las condiciones de pago", "Error conexion al servidor");
        setTimeout(() => {
          this.getOrdenFabArticuloReprocesoCantidadBase();
        }, 1000);

      });
  }

  onChangeTipo(){
      let value = <OrdenFabricacionTipoEnum> this.ofheader.tipoId;
    switch (value) {
      case OrdenFabricacionTipoEnum.ESTANDAR:
        let itemsRemove = this.articulosExtras.filter(x => x.isRPC == true);
        for (const key in itemsRemove) {
            const element = itemsRemove[key];
            const index = this.articulosExtras.indexOf(element);
            this.articulosExtras.splice(index, 1);
        }
      break;
      case OrdenFabricacionTipoEnum.ESPECIAL:
        this.OnChangeMostrarBtnReproceso();
      break;
      case OrdenFabricacionTipoEnum.DESMONTAR:

      break;

    }

  }

  OnChangeMostrarBtnReproceso(){
    let num = parseInt(this.articulo.codigoReferencia);
    if (!isNaN(num)) {
      if(num >= 400000 && num < 500000){
        this.MostrarBtnReproceso = true;
      }else{
        this.MostrarBtnReproceso = false;
      }
    }
  }


}
