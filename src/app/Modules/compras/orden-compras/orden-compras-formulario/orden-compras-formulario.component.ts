import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Proveedor } from 'src/app/Modules/mantenimientos/proveedores/models/Proveedor';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { Configuraciones } from 'src/app/shared/enums/Configuraciones';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Archivo } from 'src/app/shared/model/Archivo';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { OrdenCompra } from '../models/OrdenCompra';
import { OrdenCompraAnexoCotizaciones } from '../models/OrdenCompraAnexoCotizaciones';
import { OrdenCompraDetalle } from '../models/OrdenCompraDetalle';

@Component({
  selector: 'app-orden-compras-formulario',
  templateUrl: './orden-compras-formulario.component.html',
  styleUrls: ['./orden-compras-formulario.component.scss']
})
export class OrdenComprasFormularioComponent implements OnInit {

  ordenID: number = 0;
  Cargando: boolean = false;
  // Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  cantidadEditable = false;

  documentos: ComboBox[];
  loadingDocumentos = false;
  buscandoDocumento: boolean;

  departamentos: ComboBox[];
  loadingDepartamentos: boolean;

  sucursales: ComboBox[] = [];
  loadingSucursales = false;

  loadingProveedores: boolean;
  proveedores: ComboBox[];

  fechaActual: Date;

  loadingCompradores: boolean;
  compradores: ComboBox[];

  usuarioSolicita: Usuario;
  proveedor: Proveedor;

  loadingSolicitudCompraTipo: boolean;
  solicitudCompraTipos: ComboBox[];

  articulosDeCompra: Articulo[];

  ordenCompra: OrdenCompra;
  ordenCompraDetalles: OrdenCompraDetalle[] = [];
  loadingArticulosDeCompra: boolean;
  loadingCotizacionDetalle: boolean;

  tipoOrdenCombo: ComboBox[] = [];

  //solicitud anexos
  cargandoAnexos: boolean
  anexosArchivosSubidas: Archivo[] = [];
  urlCarpetaArchivosAnexos: string;

  //modal
  cargandoCotizaciones: boolean
  progress: number;
  filesFromInput: any[] = [];
  cotizacionesArchivosSubidas: OrdenCompraAnexoCotizaciones[] = [];
  ITBIS: number;
  loadingSolicitudDetalle: boolean;
  loadingMonedasTipo: boolean;
  monedasTipos: ComboBox[];
  loadingCondicionPagos: boolean;
  TipoCondicionPagos: ComboBox[];
  CargandoProveedor: boolean;
  loadingPlazos: boolean;
  plazos: ComboBox[];
  unidadesMedida: ComboBox[];
  loadingUnidadesMedida: boolean;
  loadingCotizacionesArchivosSubidos: boolean;
  urlCarpetaArchivosCompartidos: string;


  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private auth: AuthenticationService,
    private httpService: BackendService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    let id = Number(this.route.snapshot.paramMap.get('id'));
    this.ordenID = id;

    if (id > 0) {
      this.getOrdenCompra(id);
      this.actualizando = true;
    } else {
      this.getUsuarioByID(Number(this.auth.tokenDecoded.nameid))
    }
    
    this.getUrlCarpetaAnexosArchivos()
    this.getUrlCarpetaArchivosCotizaciones()
    this.getDepartamentos()
    this.getSucursales()
    this.getProveedores()
    this.getCompradores()
    this.getSolicitudCompraTipo()
    this.getArticulosCompra()
    this.getITBIS()

    this.llenarTipoOrdenCombo()
    this.getMonedasTipo()
    this.getTipoCondicionPago();
    this.getPlazos();
    this.getUnidadesMedida();

  }

  llenarTipoOrdenCombo() {

    let tipo1: ComboBox = { codigo: 1, grupo: "", grupoID: "", nombre: "Normal" };
    let tipo2: ComboBox = { codigo: 2, grupo: "", grupoID: "", nombre: "Abierta" };

    this.tipoOrdenCombo.push(tipo1)
    this.tipoOrdenCombo.push(tipo2)

  }

  getOrdenCompra(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<OrdenCompra>(DataApi.OrdenCompra,
      "GetOrdenCompraByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]

            this.ordenCompra = record;

            this.getHoraActual();
            this.getOrdenCompraDetalles(record.id);
            this.getAnexosSolicitudSubidos();
            this.getCotizacionesArchivosSubidos();
            this.getUsuarioByID(record.solicitanteID)
            this.getProveedor(record.proveedorID)


          } else {
            this.toastService.warning("no encontrado");
            this.router.navigateByUrl('/compras/orden-compras');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getOrdenCompraDetalles(id: number) {
    this.loadingCotizacionDetalle = true;
    this.httpService.DoPostAny<OrdenCompraDetalle>(DataApi.OrdenCompra,
      "GetOrdenCompraDetalles", id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.ordenCompraDetalles = response.records;
          console.table(this.ordenCompraDetalles)
          // this.agregarDetalleVacio()
          this.calcularTotal()
        }
        this.loadingCotizacionDetalle = false;
      }, error => {
        this.loadingCotizacionDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
        this.router.navigateByUrl('/compras/orden-compras');
      });
  }

  onSelectArticulo(item: any, index: number) {
    this.ordenCompraDetalles[index].costo = item.costo;
    if (!this.ordenCompraDetalles.some(x => x.articuloID <= 0)) {
      this.agregarDetalleVacio()
    }
    this.calcularTotal()

  }

  agregarDetalleVacio() {
    this.ordenCompraDetalles.push(new OrdenCompraDetalle())
  }

  calcularTotal() {
    this.limpiarTotales()


    this.ordenCompraDetalles.forEach(x => {
      x.subTotal = x.cantidadAprobada && x.articuloID ? (x.costo * x.cantidadAprobada) : 0;
      x.descuentoTotal = x.descuentoPorciento ? (x.subTotal * x.descuentoPorciento / 100) : 0;
      x.totalImpuesto = (x.subTotal - x.descuentoTotal) * (this.ITBIS / 100);
      x.totalNeto = x.subTotal - x.descuentoTotal
        + x.totalImpuesto;

      this.ordenCompra.descuentoTotal += x.descuentoTotal;
      this.ordenCompra.subTotal += x.subTotal;
      this.ordenCompra.totalNeto += x.cantidadAprobada && x.costo ? (x.costo * x.cantidadAprobada) : 0;
    })

    this.ordenCompra.totalNeto = this.ordenCompra.subTotal - this.ordenCompra.descuentoTotal;
    this.ordenCompra.totalImpuesto = this.ordenCompra.totalNeto * (this.ITBIS / 100);
    this.ordenCompra.totalNeto += this.ordenCompra.totalImpuesto;

  }

  limpiarTotales() {
    this.ordenCompra.subTotal = 0;
    this.ordenCompra.descuentoTotal = 0;
    // this.ordenCompra.impuestoTotal = 0;
    this.ordenCompra.totalNeto = 0;
    // this.ordenCompra.costoTotal = 0;
  }

  getArticulosCompra() {
    this.loadingArticulosDeCompra = true;
    this.httpService.DoPost<Articulo>(DataApi.Articulo,
      "GetArticulosDeCompra", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articulosDeCompra = response.records;
        }
        this.loadingArticulosDeCompra = false;
      }, error => {
        this.loadingArticulosDeCompra = false;
        this.toastService.error("No se pudo obtener los articulos", "Error conexion al servidor");

        setTimeout(() => {
          this.getArticulosCompra();
        }, 1000);

      });
  }

  onSubmit() {

    if (this.ordenCompra.proveedorID <= 0) {
      this.toastService.warning("Debes de seleccionar un proveedor.")
      return;
    }
    if (this.ordenCompra.compradorID <= 0) {
      this.toastService.warning("Debes de seleccionar un comprador.")
      return;
    }

    if (this.ordenCompra.monedaID <= 0) {
      this.toastService.warning("Debes de seleccionar una moneda.")
      return;
    }

    if (this.filesFromInput.length <= 0 && this.cotizacionesArchivosSubidas.length <= 0) {
      this.toastService.warning("Debes de subir las cotizaciones.")
      return;
    }

    //que una cotizacion este seleccionada
    if (!this.filesFromInput.some(x => x.seleccionada) && !this.cotizacionesArchivosSubidas.some(x => x.escogida)) {
      this.toastService.warning("Debes de marcar la cotización escogida.")
      return;
    }

    this.guardar();
  }


  guardar() {

    let parametro: any = {
      "ordenCompra": this.ordenCompra,
      "ordenCompraDetalles": this.ordenCompraDetalles
    }
    console.log(parametro)

    let metodo: string = this.actualizando ? "Update" : "Registrar";

    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<Proveedor>(DataApi.OrdenCompra,
      metodo, parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          // this.toastService.success("Realizado", "OK");
          if (this.filesFromInput.length > 0) {
            this.subirCotizacionesAlServidor();
          } else {
            this.toastService.success("Realizado", "OK");
            this.router.navigateByUrl('/compras/orden-compras');
          }
          // this.enviarCorreoAutorizacionPendiente()
          // this.router.navigateByUrl('/compras/orden-compras');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getUsuarioByID(usuarioID: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<any>(DataApi.Usuario,
      "GetUsuarioByID", usuarioID).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            let usuario = response.records[0];
            delete usuario.passwordHash;
            delete usuario.passwordSalt;
            this.usuarioSolicita = usuario;
          } else {
            this.toastService.warning("Usuario no encontrado");
            this.router.navigateByUrl('/compras/orden-compras');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getDepartamentos() {
    this.loadingDepartamentos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetDepartamentos", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.departamentos = response.records;
        }
        this.loadingDepartamentos = false;
      }, error => {
        this.loadingDepartamentos = false;
        this.toastService.error("No se pudo obtener los departamentos", "Error conexion al servidor");
        setTimeout(() => {
          this.getDepartamentos();
        }, 1000);
      });
  }

  getProveedores() {
    this.loadingProveedores = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetProveedores", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.proveedores = response.records;
        }
        this.loadingProveedores = false;
      }, error => {
        this.loadingProveedores = false;
        this.toastService.error("No se pudo obtener los Proveedores", "Error conexion al servidor");
        setTimeout(() => {
          this.getProveedores();
        }, 1000);
      });
  }

  getCompradores() {
    this.loadingCompradores = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetCompradores", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.compradores = response.records;
        }
        this.loadingCompradores = false;
      }, error => {
        this.loadingCompradores = false;
        this.toastService.error("No se pudo obtener los compradores", "Error conexion al servidor");
        setTimeout(() => {
          this.getCompradores();
        }, 1000);
      });
  }

  getSolicitudCompraTipo() {
    this.loadingSolicitudCompraTipo = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSolicitudCompraTipo", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.solicitudCompraTipos = response.records;
        }
        this.loadingSolicitudCompraTipo = false;
      }, error => {
        this.loadingSolicitudCompraTipo = false;
        this.toastService.error("No se pudo obtener los tipos de solicitudes", "Error conexion al servidor");
        setTimeout(() => {
          this.getSolicitudCompraTipo();
        }, 1000);
      });
  }

  getSucursales() {
    this.loadingSucursales = true;
    let parametros: Parametro[] = [
      {
        key: "CompaniaID",
        value: 0
      }
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSucursalesByCompania", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sucursales = response.records;
        }

        this.loadingSucursales = false;
      }, error => {
        this.loadingSucursales = false;
        this.toastService.error("No se pudo obtener las sucursales.", "Error conexion al servidor");
        setTimeout(() => {
          this.getSucursales();
        }, 1000);
      });
  }

  getHoraActual() {
    this.Cargando = true;
    this.httpService.DoPost<ComboBox>(DataApi.Public,
      "GetHoraActual", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.fechaActual = new Date(response.valores[0]);
          // this.ordenCompra.fechaEntrega = response.valores[0];

          //sumarle un dia
          // this.ordenCompra.fechaEntrega.setDate(this.ordenCompra.fechaEntrega.getDate() + 1);
        }

        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  enviarCorreoAutorizacionPendiente() {

    let param = {
      "EstadoAutorizacionSiguiente": 2,
      "SolicitanteID": Number(this.ordenCompra.solicitanteID)
    }

    this.httpService.DoPostAny<any>(DataApi.OrdenCompra,
      "EnviarCorreoAutorizacionPendiente", param).subscribe(response => {

        if (!response.ok) {
          // this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          // this.toastService.success("Notificaciones enviadas", "OK");
        }
      }, error => {
        console.error(error)
      });

  }



  getITBIS() {
    // this.loa = true;
    this.httpService.DoPostAny<any>(DataApi.Configuracion,
      "GetConfiguracionValor", Number(Configuraciones.IMPUESTO_PORCIENTO)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          if (response.records.length == 0 || response.records[0] < 1) {
            this.toastService.error("No hay impuesto configurado");
            console.error("No hay impuesto configurado")
          } else {
            this.ITBIS = Number(response.records[0]);
          }

        }
        // this.loadingCondicionPagos = false;
      }, error => {
        // this.loadingCondicionPagos = false;
        this.toastService.error("No se pudo obtener las condiciones de pago", "Error conexion al servidor");

        setTimeout(() => {
          this.getITBIS();
        }, 1000);

      });
  }


  // COTIZACIONES UPLOAD

  setFiles(selectedfiles: any[]) {

    if (selectedfiles && selectedfiles.length > 0) {
      // this.filesFromInput = []
      for (let i = 0; i < selectedfiles.length; i++) {
        const element = selectedfiles[i];
        this.filesFromInput.push(element)
      }
    }
    // this.modalService.dismissAll();
  }

  onDeleteCotizacionSeleccionada(index: number) {
    this.filesFromInput.splice(index, 1);
    // console.log(this.filesFromInput)
  }


  subirCotizacionesAlServidor() {

    const formData = new FormData();
    formData.append("OrdenCompraID", this.ordenID + '');

    for (let file of this.filesFromInput)
      formData.append("files", file);

    let cotizacionEscogida = this.filesFromInput.find(x => x.seleccionada);

    let cotizacionEscogidaFileName: string = cotizacionEscogida ? cotizacionEscogida.name : "";
    formData.append("CotizacionSeleccionadaFileName", cotizacionEscogidaFileName);

    this.httpService.DoPostAny<any>(DataApi.Upload,
      "UploadOrdenComprasCotizacionesArchivos", formData).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/compras/orden-compras');

          // this.modalService.dismissAll()
          // this.router.navigateByUrl('/mantenimientos/almacen');
        }

        // this.btnGuardarCargando = false;
      }, error => {
        // this.btnGuardarCargando = false; 
        this.toastService.error("Error conexion al servidor");
      });


  }


  getAnexosSolicitudSubidos() {
    this.cargandoAnexos = true;
    this.httpService.DoPostAny<Archivo>(DataApi.SolicitudCompra,
      "GetSolicitudCompraAnexosArchivos", this.ordenCompra.solicitudCompraID).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.anexosArchivosSubidas = response.records;
        }

        this.cargandoAnexos = false;
      }, error => {
        this.cargandoAnexos = false;
        console.error(error)
        this.toastService.error("Error conexion al servidor");
      });

  }

  getUrlCarpetaAnexosArchivos() {
    this.loadingSolicitudDetalle = true;
    this.httpService.DoPostAny<string>(DataApi.Configuracion,
      "GetConfiguracionValor", Number(Configuraciones.URL_ARCHIVOS_COMPARTIDOS_WEB_ADMIN)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.urlCarpetaArchivosAnexos = response.records[0];
        }
        this.loadingSolicitudDetalle = false;
      }, error => {
        console.error(error)
        this.loadingSolicitudDetalle = false;
        this.toastService.error("No se pudo obtener la url de los archivos", "Error conexion al servidor");
      });
  }

  onSelectCotizacion(item: any, index: number) {

    this.filesFromInput.forEach(x => x.seleccionada = false);
    this.filesFromInput[index].seleccionada = true;

  }

  getMonedasTipo() {
    this.loadingMonedasTipo = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetMonedas", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.monedasTipos = response.records;
        }
        this.loadingMonedasTipo = false;
      }, error => {
        this.loadingMonedasTipo = false;
        this.toastService.error("No se pudo obtener los tipos de moneda", "Error conexion al servidor");
      });
  }

  getTipoCondicionPago() {
    this.loadingCondicionPagos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTipoCondicionPago", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.TipoCondicionPagos = response.records;
        }
        this.loadingCondicionPagos = false;
      }, error => {
        this.loadingCondicionPagos = false;
        this.toastService.error("No se pudo obtener las condiciones de pago", "Error conexion al servidor");

        setTimeout(() => {
          this.getTipoCondicionPago();
        }, 1000);

      });
  }

  getProveedor(id: number) {
    this.CargandoProveedor = true;
    this.httpService.DoPostAny<Proveedor>(DataApi.Proveedor,
      "GetProveedorByID", id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            this.proveedor = response.records[0];
          } else {
            this.toastService.warning("Proveedor no encontrado");
          }

        }
        this.CargandoProveedor = false;

      }, error => {
        console.error(error)
        this.CargandoProveedor = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  onChangeProveedor(e: ComboBox) {
    this.getProveedor(e.codigo)
  }

  getPlazos() {
    this.loadingPlazos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetPlazos", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.plazos = response.records;
        }
        this.loadingPlazos = false;
      }, error => {
        this.loadingPlazos = false;
        this.toastService.error("No se pudo obtener los plazos", "Error conexion al servidor");

        setTimeout(() => {
          this.getPlazos()
        }, 1000);

      });
  }

  getUnidadesMedida() {
    this.loadingUnidadesMedida = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUnidadesMedida", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.unidadesMedida = response.records;
          console.table(this.unidadesMedida)
        }
        this.loadingUnidadesMedida = false;
      }, error => {
        this.loadingUnidadesMedida = false;
        this.toastService.error("No se pudo obtener las UnidadesMedida", "Error conexion al servidor");

        setTimeout(() => {
          this.getUnidadesMedida()
        }, 1000);

      });
  }

  getCotizacionesArchivosSubidos() {
    this.loadingCotizacionesArchivosSubidos = true;
    this.httpService.DoPostAny<OrdenCompraAnexoCotizaciones>(DataApi.OrdenCompra,
      "GetOrdenCompraCotizacionesArchivos", this.ordenCompra.id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.cotizacionesArchivosSubidas = response.records;
          console.table(this.cotizacionesArchivosSubidas)
        }
        this.loadingCotizacionesArchivosSubidos = false;
      }, error => {
        this.loadingCotizacionesArchivosSubidos = false;
        this.toastService.error("No se pudo obtener las cotizaciones subidas", "Error conexion al servidor");

        setTimeout(() => {
          this.getCotizacionesArchivosSubidos()
        }, 1000);

      });
  }

  deleteOrdenCompraCotizacionArchivoByID(id: number) {
    this.loadingCotizacionesArchivosSubidos = true;
    this.httpService.DoPostAny<string>(DataApi.OrdenCompra,
      "DeleteOrdenCompraCotizacionArchivoByID", id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.toastService.success("Realizado");
          this.getCotizacionesArchivosSubidos();
        }
        this.loadingCotizacionesArchivosSubidos = false;
      }, error => {
        console.error(error)
        this.loadingCotizacionesArchivosSubidos = false;
        this.toastService.error("Error", "Error conexion al servidor");
      });
  }

  updateCotizacionEscogidaByID(item: OrdenCompraAnexoCotizaciones) {

    let param = {
      "OrdenID": this.ordenCompra.id,
      "CotizacionID": item.id,
      "Escogida": !item.escogida
    }
    this.loadingCotizacionesArchivosSubidos = true;
    this.httpService.DoPostAny<string>(DataApi.OrdenCompra,
      "UpdateCotizacionEscogidaByID", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.toastService.success("Realizado");
          this.getCotizacionesArchivosSubidos();
        }
        // this.loadingCotizacionesArchivosSubidos = false;
      }, error => {
        console.error(error)
        this.loadingCotizacionesArchivosSubidos = false;
        this.toastService.error("Error", "Error conexion al servidor");
      });
  }


  getUrlCarpetaArchivosCotizaciones() {
    this.loadingSolicitudDetalle = true;
    this.httpService.DoPostAny<string>(DataApi.Configuracion,
      "GetConfiguracionValor", Number(Configuraciones.URL_ARCHIVOS_COMPARTIDOS_WEB_ADMIN)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.urlCarpetaArchivosCompartidos = response.records[0];
        }
        this.loadingSolicitudDetalle = false;
      }, error => {
        console.error(error)
        this.loadingSolicitudDetalle = false;
        this.toastService.error("No se pudo obtener la url de los archivos", "Error conexion al servidor");
      });
  }



}
