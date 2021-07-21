import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Proveedor } from 'src/app/Modules/mantenimientos/proveedores/models/Proveedor';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { OrdenCompra } from '../models/OrdenCompra';
import { OrdenCompraDetalle } from '../models/OrdenCompraDetalle';

@Component({
  selector: 'app-orden-compras-formulario',
  templateUrl: './orden-compras-formulario.component.html',
  styleUrls: ['./orden-compras-formulario.component.scss']
})
export class OrdenComprasFormularioComponent implements OnInit {


  Cargando: boolean = false;
  Formulario: FormGroup;
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

  usuario: Usuario;

  loadingSolicitudCompraTipo: boolean;
  solicitudCompraTipos: ComboBox[];

  articulosDeCompra: Articulo[];
  ordenCompraDetalles: OrdenCompraDetalle[] = [new OrdenCompraDetalle()];
  total: number;
  loadingArticulosDeCompra: boolean;
  loadingCotizacionDetalle: boolean;
  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private auth: AuthenticationService,
    private httpService: BackendService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    let id = Number(this.route.snapshot.paramMap.get('id'));
    this.CreateForm();

    if (id > 0) {
      this.getOrdenCompra(id);
      this.actualizando = true;
    } else {
      this.getUsuarioByID(Number(this.auth.tokenDecoded.nameid))
    }

    this.getDepartamentos()
    this.getSucursales()
    this.getProveedores()
    this.getCompradores()
    this.getSolicitudCompraTipo()
    this.getArticulosCompra()
    this.getHoraActual()
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      solicitudCompraID: [0],
      codigoReferencia: [null,],
      departamentoID: new FormControl({ value: null, disabled: true }, [Validators.required]),
      solicitanteID: [Number(this.auth.tokenDecoded.nameid), [Validators.required]],
      sucursalID: new FormControl({ value: null, disabled: true }, [Validators.required]),
      estadoID: [0,],
      fechaSolicitud: [new Date(),],
      compradorID: [null, [Validators.required]],
      fechaEntrega: [new Date(), [Validators.required]],
      fechaConversion: [new Date(), [Validators.required]],
      proveedorID: [0],
      tipoSolicitudID: new FormControl({ value: null, disabled: true }, [Validators.required]),
      comentario: new FormControl({ value: null, disabled: true }, [Validators.required]),
      solicitanteDepartamentoID: [0,],
      solicitanteSucursalID: [0,],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

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
            this.Formulario.setValue(record);
            this.getOrdenCompraDetalles(record.id)
            this.getUsuarioByID(record.solicitanteID)

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
    console.table(this.ordenCompraDetalles)
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
      x.subtotal = x.cantidad && x.articuloID ? (x.costo * x.cantidad) : 0;
      x.totalDescuento = x.descuentoPorciento ? (x.subtotal * x.descuentoPorciento / 100) : 0;
      // x.totalImpuesto = (x.subtotal - x.totalDescuento) * (this.ITBIS / 100);
      x.totalNeto = x.subtotal - x.totalDescuento
      // + x.totalImpuesto;

      // this.cotizacion.descuentoTotal += x.totalDescuento;
      // this.cotizacion.subtotal += x.subtotal;
      // this.cotizacion.costoTotal += x.cantidad && x.costo ? (x.costo * x.cantidad) : 0;
    })
    // this.cotizacion.totalNeto = this.cotizacion.subtotal - this.cotizacion.descuentoTotal;
    // this.cotizacion.impuestoTotal = this.cotizacion.totalNeto * (this.ITBIS / 100);
    // this.cotizacion.totalNeto += this.cotizacion.impuestoTotal;

  }

  limpiarTotales() {
    this.total = 0;

    // this.cotizacion.subtotal = 0;
    // this.cotizacion.descuentoTotal = 0;
    // this.cotizacion.impuestoTotal = 0;
    // this.cotizacion.totalNeto = 0;
    // this.cotizacion.costoTotal = 0;
  }

  onDeleteitem(index: number) {
    this.ordenCompraDetalles.splice(index, 1);
    if (!this.ordenCompraDetalles.some(x => x.articuloID <= 0)) {
      this.agregarDetalleVacio()
    }
    this.calcularTotal()
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
    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }

    // if (this.f.tipoSolicitudID.value == 2 && !this.f.comentario.value) {
    //   this.toastService.warning("Si la solicitud es urgente debes de llenar el campo comentario.")
    //   return;
    // }

    // if (!this.solicitudCompraDetalles.some(x => x.articuloID > 0)) {
    //   this.toastService.warning("Debes de tener al menos un artículo.")
    //   return;
    // }
    // if (this.solicitudCompraDetalles.some(x => x.articuloID > 0 && x.cantidad < 1)) {
    //   this.toastService.warning("Tienes artículos sin cantidad.")
    //   return;
    // }

    this.guardar();
  }


  guardar() {

    let parametro: any = {
      "ordenCompra": this.Formulario.value,
      "ordenCompraDetalles": this.ordenCompraDetalles.filter(x => x.articuloID > 0 && x.cantidad > 0)
    }
    console.log(parametro)

    let metodo: string = this.actualizando ? "Update" : "Registrar";

    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<Proveedor>(DataApi.OrdenCompra,
      metodo, parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.enviarCorreoAutorizacionPendiente()
          this.router.navigateByUrl('/compras/orden-compras');
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
            this.usuario = usuario;
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
        // value: this.authService.tokenDecoded.primarygroupsid
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
      "SolicitanteID": Number(this.f.solicitanteID.value)
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




}
