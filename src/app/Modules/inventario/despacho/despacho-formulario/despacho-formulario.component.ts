import { Component, OnInit } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ArticuloBalanceViewModel } from 'src/app/Modules/mantenimientos/articulos/models/ArticuloBalanceViewModel';
import { ArticuloListaPrecioViewModel } from 'src/app/Modules/mantenimientos/articulos/models/ArticuloListaPrecioViewModel';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { ListaPrecio } from 'src/app/Modules/mantenimientos/listaPrecios/models/ListaPrecio';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { Configuraciones } from 'src/app/shared/enums/Configuraciones';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { DespachoPedido } from '../models/DespachoPedido';
import { DespachoPedidoDetalle } from '../models/DespachoPedidoDetalle';
import { DespachoPedidoDetalleViewModel } from '../models/DespachoPedidoDetalleViewModel';

@Component({
  selector: 'app-despacho-formulario',
  templateUrl: './despacho-formulario.component.html',
  styleUrls: ['./despacho-formulario.component.scss']
})
export class DespachoFormularioComponent implements OnInit {

  Cargando: boolean = false;
  btnGuardarCargando = false;
  limitExceeded = false;

  actualizando = false;
  loadingClientes: boolean;
  clientes: ComboBox[];
  cliente: Cliente;

  loadingArticulosCombobox: boolean;
  articulosCombobox: ArticuloListaPrecioViewModel[];
  listaPrecio: ListaPrecio;

  loadingCondicionPagos: boolean;
  TipoCondicionPagos: ComboBox[];

  loadingMonedaTipos: boolean;
  monedaTipos: ComboBox[];

  loadingAlmacenes: boolean;
  almacenes: ComboBox[] =null;

  vendedores: ComboBox[];
  loadingVendedores: boolean;

  usuario: Usuario;
  ITBIS: number = 0;

  pedidoEmpleado: DespachoPedido = new DespachoPedido();
  pedidoEmpleadoDetalles: DespachoPedidoDetalle[] = [];

  loadingArticuloBalance: boolean;
  articuloBalance: ArticuloBalanceViewModel[];
  totalCantidadExistencia: number;
  loadingPedidoEmpleadoDetalle: boolean;
  loadingInfoCliente: boolean;
  clienteExiste=true;
  balanceEmpleado:number;
  idPedidoEmpleadoByRouter:number;
  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private authService: AuthenticationService,
  ) { }

  ngOnInit(): void {

    let id = Number(this.route.snapshot.paramMap.get('id'));
    this.idPedidoEmpleadoByRouter=id;
    if (id > 0) {
      this.getCotizacion(id);
      this.actualizando = true;
    }else{
      this.getClienteByUsuarioID(Number(this.authService.tokenDecoded.nameid));
    }

    this.getUsuarioByID(Number(this.authService.tokenDecoded.nameid));
    this.getITBIS()

    this.getTipoCondicionPago()
    this.getMonedaTipos()
    this.getVendedores()
  }

  getCotizacion(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<DespachoPedido>(DataApi.PedidosEmpleado,
      "GetPedidosEmpleadoByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.pedidoEmpleado = record;
            this.getClienteByID(this.pedidoEmpleado.clienteId)
            this.getPedidoEmpleadoDetalles(this.pedidoEmpleado.id)
          } else {
            this.toastService.warning("Pedido Empleado no encontrado");
            this.router.navigateByUrl('/ventas/pedidos-empleado');
          }
        }
        this.Cargando = false;

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getPedidoEmpleadoDetalles(pedidoEmpleadoID: number) {
    this.loadingPedidoEmpleadoDetalle = true;
    this.httpService.DoPostAny<DespachoPedidoDetalleViewModel>(DataApi.PedidosEmpleado,
      "GetPedidosEmpleadoDetalles", pedidoEmpleadoID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.pedidoEmpleadoDetalles = response.records;
          this.agregarDetalleVacio()
        }
        this.loadingPedidoEmpleadoDetalle = false;
      }, error => {
        this.loadingPedidoEmpleadoDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
        this.router.navigateByUrl('/ventas/pedidos-empleado');
      });
  }

  getUsuarioByID(usuarioID: number) {
    //this.Cargando = true;
    this.httpService.DoPostAny<Usuario>(DataApi.Usuario,
      "GetUsuarioByID", usuarioID).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            this.usuario = response.records[0];

          } else {
            this.toastService.warning("Usuario no encontrado");
            this.router.navigateByUrl('/ventas/pedidos-empleado');
          }
        }

      }, error => {
      //  this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  agregarDetalleVacio() {
    if(this.almacenes==null){
      this.getAlmacenes();
      return;
    }
    if(this.almacenes!= undefined && this.almacenes.length>0){
      this.pedidoEmpleadoDetalles.push({
        almacenId: this.almacenes[0].codigo, articuloId: 0, cantidad: undefined, costo: 0,
        cotizacionId: 0, id: 0,
        porcientoDescuento: undefined, precio: 0,
        subtotal: 0, totalDescuento: 0, totalImpuesto: 0, totalNeto: 0,
        estadoId:2,
      })
    }else{
      this.toastService.warning("Debe asignarle un almacen a este empleado")
      return;
    }
 
  }

  onSubmit() {
     if(( this.cliente.limiteCredito-this.pedidoEmpleado.totalNeto)<0 ){
      this.toastService.warning("Este pedido esta excediendo el limite de credito");
     return ;
   }
    if (!this.pedidoEmpleado.vendedorId || this.pedidoEmpleado.vendedorId < 1) {
      this.toastService.warning("Selecciona un vendedor")
      return;
    }

    if (this.pedidoEmpleado.monedaId < 1) {
      this.toastService.warning("Selecciona una moneda")
      return;
    }

    if (!this.pedidoEmpleadoDetalles.some(x => x.articuloId > 0)) {
      this.toastService.warning("No puedes hacer una pedido  sin artículos")
      return;
    }

    if (this.pedidoEmpleadoDetalles.filter(x => x.articuloId > 0)
      .some(x => !x.cantidad || x.cantidad <= 0 || !x.precio || x.precio <= 0)) {
      this.toastService.warning("Artículos con datos incompletos, revisa precios y cantidades.")
      return;
    }

    if (this.pedidoEmpleadoDetalles.some(x => x.porcientoDescuento > this.usuario.descuentoVenta)) {
      this.toastService.warning(`Solo puedes autorizar un descuento del ${this.usuario.descuentoVenta}%.`)
      return;
    }

    this.guardar();
  }


  guardar() {
    let metodo: string = this.actualizando ? "Update" : "Registrar";

    this.pedidoEmpleado.sucursalId = Number(this.authService.tokenDecoded.groupsid)
    this.pedidoEmpleado.usuarioId = Number(this.authService.tokenDecoded.nameid)

    let parametro: any = {
      "PedidoEmpleado": this.pedidoEmpleado,
      "PedidoEmpleadoDetalles": this.pedidoEmpleadoDetalles.filter(x => x.articuloId > 0 && x.cantidad > 0 && x.precio > 0)
    }

    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<any>(DataApi.PedidosEmpleado,
      metodo, parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/ventas/pedidos-empleado');
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

  getClienteByUsuarioID(usuarioId: number) {
    this.loadingInfoCliente = true;
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteByUsuarioID", usuarioId).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
           
            this.cliente = response.records[0];
            this.clienteExiste=true;
            this.cliente.apellidos = this.cliente.apellidos==null?"":this.cliente.apellidos;
            this.pedidoEmpleado.clienteId=this.cliente.id;
            this.balanceEmpleado = this.cliente.balance;
            this.getArticulosPrecioActual()
            this.agregarDetalleVacio();
            this.loadingInfoCliente = false;

          } else {
            this.clienteExiste=false;
            this.loadingInfoCliente = false;

            this.toastService.warning("Cliente no encontrado");
          }
        }

      }, error => {
        this.loadingInfoCliente = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getClienteByID(id: number) {
    this.loadingInfoCliente = true;
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            this.cliente = response.records[0];
            this.cliente.apellidos = this.cliente.apellidos==null?"":this.cliente.apellidos;
            this.balanceEmpleado = this.cliente.balance;
            this.clienteExiste=true;
            this.getArticulosPrecioActual()
          } else {
            this.toastService.warning("Cliente no encontrado");
            this.clienteExiste=false;
          }
        }
        this.loadingInfoCliente = false;
      }, error => {
        this.loadingInfoCliente = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  onSelectCliente(cliente: ComboBox) {
    this.cliente = null
    if (cliente) {
      this.getClienteByID(cliente.codigo)
    }
    this.pedidoEmpleadoDetalles = []
    //this.agregarDetalleVacio()
    this.limpiarTotales()

  }


  onSelectArticulo(item: ArticuloListaPrecioViewModel, index: number) {
    this.pedidoEmpleadoDetalles[index].precio = item.precioActual;
    this.pedidoEmpleadoDetalles[index].costo = item.costo;
    if (!this.pedidoEmpleadoDetalles.some(x => x.articuloId <= 0)) {
      this.agregarDetalleVacio()
    }
    this.calcularTotales()

  }


  getArticulosPrecioActual() {
    this.httpService.DoPostAny<ArticuloListaPrecioViewModel>(DataApi.Articulo,
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
    this.pedidoEmpleadoDetalles.splice(index, 1);
    if (!this.pedidoEmpleadoDetalles.some(x => x.id <= 0)) {
      this.agregarDetalleVacio()
    }
    this.calcularTotales()
  }

  calcularTotales() {
    this.limpiarTotales()

    this.pedidoEmpleadoDetalles.forEach(x => {
      x.subtotal = x.cantidad && x.articuloId ? (x.precio * x.cantidad) : 0;
      x.totalDescuento = x.porcientoDescuento ? (x.subtotal * x.porcientoDescuento / 100) : 0;
      x.totalImpuesto = (x.subtotal - x.totalDescuento) * (this.ITBIS / 100);
      x.totalNeto = x.subtotal - x.totalDescuento + x.totalImpuesto;

      this.pedidoEmpleado.descuentoTotal += x.totalDescuento;
      this.pedidoEmpleado.subtotal += x.subtotal;
      this.pedidoEmpleado.costoTotal += x.cantidad && x.costo ? (x.costo * x.cantidad) : 0;
    })
    this.pedidoEmpleado.totalNeto = this.pedidoEmpleado.subtotal - this.pedidoEmpleado.descuentoTotal;
    this.pedidoEmpleado.impuestoTotal = this.pedidoEmpleado.totalNeto * (this.ITBIS / 100);
    this.pedidoEmpleado.totalNeto += this.pedidoEmpleado.impuestoTotal;
    this.cliente.balance= this.cliente.limiteCredito;
    this.cliente.balance=(this.cliente.balance- this.pedidoEmpleado.totalNeto);

    if(this.cliente.balance<0){
     this.limitExceeded=true;
     return;
    }
    this.limitExceeded=false;
  }

  limpiarTotales() {
    this.pedidoEmpleado.subtotal = 0;
    this.pedidoEmpleado.descuentoTotal = 0;
    this.pedidoEmpleado.impuestoTotal = 0;
    this.pedidoEmpleado.totalNeto = 0;
    this.pedidoEmpleado.costoTotal = 0;
  }

  getITBIS() {
    // this.loadingCondicionPagos = true;
    this.httpService.DoPostAny<any>(DataApi.Configuracion,
      "GetConfiguracionValor", Number(Configuraciones.IMPUESTO_PORCIENTO)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          if (response.records.length == 0 || response.records[0] < 1) {
            this.toastService.error("No hay impuesto configurado");
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
          this.pedidoEmpleado.vendedorId=response.records[0]?.codigo;
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
            this.pedidoEmpleado.monedaId = this.monedaTipos[0].codigo
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
    console.log('get almacenes')
    let parametros: Parametro[] = [
      { key: "usuarioID", value: this.authService.tokenDecoded.nameid },
      { key: "ModuloKey", value: EstadosGeneralesKeyEnum.COTIZACION },
    ]
    this.loadingAlmacenes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuarioAlmacenesModulo", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almacenes = response.records;
          if(this.almacenes.length>0){
             this.agregarDetalleVacio();
          }
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
    this.modalService.open(content, { size: 'lg', });
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


