import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Almacen } from 'src/app/Modules/mantenimientos/almacenes/models/Almacen';
import { ArticuloBalanceViewModel } from 'src/app/Modules/mantenimientos/articulos/models/ArticuloBalanceViewModel';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { ListaPrecio } from 'src/app/Modules/mantenimientos/listaPrecios/models/ListaPrecio';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadoGeneralesKey } from 'src/app/shared/enums/EstadoGeneralesKey';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { CotizacionDetalle } from '../models/CotizacionDetalle';

@Component({
  selector: 'app-cotizaciones-formulario',
  templateUrl: './cotizaciones-formulario.component.html',
  styleUrls: ['./cotizaciones-formulario.component.scss']
})
export class CotizacionesFormularioComponent implements OnInit {

  Cargando: boolean = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingClientes: boolean;
  clientes: ComboBox[];
  cliente: Cliente;
  loadingArticulosCombobox: boolean;
  articulosCombobox: any[];
  listaPrecio: ListaPrecio;
  articulosCotizacion: CotizacionDetalle[] = [];
  loadingCondicionPagos: boolean;
  TipoCondicionPagos: ComboBox[];
  loadingMonedaTipos: boolean;
  monedaTipos: ComboBox[];

  totalNetoCotizacion: number = 0;
  subTotalCotizacion: number = 0;
  totalDescuentoCotizacion: number = 0;
  totalImpuestoCotizacion: number = 0;
  loadingAlmacenes: boolean;
  almacenes: ComboBox[];
  loadingArticuloBalance: boolean;
  articuloBalance: ArticuloBalanceViewModel[];
  totalCantidadExistencia: number;
  monedaID: number;
  clienteID: number;
  vendedorId: number;
  vendedores: ComboBox[];
  loadingVendedores: boolean;
  ITBIS: number = 0.18;

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private router: Router,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.getAlmacenes()
    this.getClientes()
    this.getTipoCondicionPago()
    this.getMonedaTipos()
    this.getVendedores()
  }

  agregarDetalleVacio() {
    this.articulosCotizacion.push({
      almacenId: this.almacenes[0].codigo, articuloId: 0, cantidad: undefined, costo: 0,
      cotizacionId: 0, id: 0,
      porcientoDescuento: undefined, precio: 0,
      subtotal: 0, totalDescuento: 0, totalImpuesto: 0, totalNeto: 0
    })
  }

  onSubmit() {

    // this.submitted = true;
    // if (this.Formulario.invalid) {
    //   return;
    // }


    this.guardar();
  }


  guardar() {

    let parametro: any = {
      "Cotizacion": {
        "sucursalID": Number(this.authService.tokenDecoded.groupsid),
        "clienteID": this.clienteID,
        "VendedorId": this.vendedorId,
        "Subtotal": this.subTotalCotizacion,
        "DescuentoTotal": this.totalDescuentoCotizacion,
        "ImpuestoTotal": this.totalImpuestoCotizacion,
        "TotalNeto": this.totalNetoCotizacion,
        "monedaID": this.monedaID,
        "UsuarioId": Number(this.authService.tokenDecoded.nameid),
      },
      "CotizacionDetalles": this.articulosCotizacion.filter(x => x.id > 0 && x.cantidad > 0)
    }
    console.log(parametro)

    let metodo: string = "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<any>(DataApi.Cotizacion,
      metodo, parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/ventas/cotizacion');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getClientes(searchObj: any = null, clienteID: number = 0) {
    let search = ""

    if (searchObj)
      search = searchObj.term;

    this.loadingClientes = true;
    let parametros: Parametro[] = [
      { key: "CompaniaID", value: this.authService.tokenDecoded.primarygroupsid },
      { key: "Search", value: search },
      { key: "clienteID", value: clienteID },
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetClientesComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.clientes = response.records;
        }

        this.loadingClientes = false;
      }, error => {
        this.loadingClientes = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getClienteByID(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            this.cliente = response.records[0];
            this.getArticulosPrecioActual()
          } else {
            this.toastService.warning("Cliente no encontrado");
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  onSelectCliente(cliente: ComboBox) {
    this.cliente = null
    if (cliente) {
      this.getClienteByID(cliente.codigo)
    }
    this.agregarDetalleVacio()
    this.articulosCotizacion[0].almacenId = this.almacenes[0].codigo
    this.limpiarTotales()

  }


  onSelectArticulo(item: any, index: number) {
    this.articulosCotizacion[index].precio = item.precio;
    if (!this.articulosCotizacion.some(x => x.id <= 0)) {
      this.agregarDetalleVacio()
    }
    this.calcularTotales()

  }


  getArticulosPrecioActual() {
    this.httpService.DoPostAny<any>(DataApi.Articulo,
      "GetArticulosPrecioActual", this.cliente.listaPrecioId).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            this.articulosCombobox = response.records
          } else {
            this.toastService.warning("La lista del cliente no tiene artículos");
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  onDeleteitem(index: number) {
    this.articulosCotizacion.splice(index, 1);
    if (!this.articulosCotizacion.some(x => x.id <= 0)) {
      this.agregarDetalleVacio()
    }
    this.calcularTotales()
  }

  calcularTotales() {
    this.limpiarTotales()

    this.articulosCotizacion.forEach(x => {
      x.subtotal = x.cantidad && x.id ? (x.precio * x.cantidad) : 0;
      x.totalDescuento = x.porcientoDescuento ? (x.subtotal * x.porcientoDescuento / 100) : 0;
      x.totalImpuesto = (x.subtotal - x.totalDescuento) * this.ITBIS;
      x.totalNeto = x.subtotal - x.totalDescuento + x.totalImpuesto;

      this.totalDescuentoCotizacion += x.totalDescuento;
      this.subTotalCotizacion += x.subtotal;
    })
    this.totalNetoCotizacion = this.subTotalCotizacion - this.totalDescuentoCotizacion;
    this.totalImpuestoCotizacion = this.totalNetoCotizacion * this.ITBIS;
    this.totalNetoCotizacion += this.totalImpuestoCotizacion;
  }

  limpiarTotales() {
    this.subTotalCotizacion = 0;
    this.totalDescuentoCotizacion = 0;
    this.totalImpuestoCotizacion = 0;
    this.totalNetoCotizacion = 0;
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

  getVendedores() {
    this.loadingVendedores = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetVendedores", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.vendedores = response.records;
        }
        this.loadingVendedores = false;
      }, error => {
        this.loadingVendedores = false;
        this.toastService.error("No se pudo obtener los vendedores", "Error conexion al servidor");

        setTimeout(() => {
          this.getVendedores();
        }, 1000);

      });
  }


  getMonedaTipos() {
    this.loadingMonedaTipos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetMonedas", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.monedaTipos = response.records;

          if (this.monedaTipos && this.monedaTipos.length > 0) {
            this.monedaID = this.monedaTipos[0].codigo
          }

        }
        this.loadingMonedaTipos = false;
      }, error => {
        this.loadingMonedaTipos = false;
        this.toastService.error("No se pudo obtener los tipos de monedas", "Error conexion al servidor");

        setTimeout(() => {
          this.getMonedaTipos();
        }, 1000);

      });
  }

  getAlmacenes() {
    let parametros: Parametro[] = [
      { key: "usuarioID", value: this.authService.tokenDecoded.nameid },
      { key: "ModuloKey", value: EstadoGeneralesKey.COTIZACION },
    ]
    this.loadingAlmacenes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuarioAlmacenesModulo", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almacenes = response.records;
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

  openModal(content, articuloID: number) {
    this.articuloBalance = [];
    this.getArticuloBalanceAlmacenes(articuloID);
    this.modalService.open(content, { size: 'lg', backdrop: "static", });
  }


  getArticuloBalanceAlmacenes(articuloID: number) {
    this.loadingArticuloBalance = true;
    this.httpService.DoPostAny<ArticuloBalanceViewModel>(DataApi.Articulo,
      "GetArticuloBalanceAlmacenes", articuloID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articuloBalance = response.records;
          this.totalCantidadExistencia = 0;

          if (this.articuloBalance) {
            this.articuloBalance.forEach(ab => this.totalCantidadExistencia += ab.existencia)
          }
        }
        this.loadingArticuloBalance = false;
      }, error => {
        this.loadingArticuloBalance = false;
        this.toastService.error("No se pudo obtener la existencia", "Error conexion al servidor");
      });
  }

}
