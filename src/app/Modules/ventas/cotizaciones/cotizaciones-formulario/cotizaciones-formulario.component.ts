import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Almacen } from 'src/app/Modules/mantenimientos/almacenes/models/Almacen';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { ListaPrecio } from 'src/app/Modules/mantenimientos/listaPrecios/models/ListaPrecio';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';

@Component({
  selector: 'app-cotizaciones-formulario',
  templateUrl: './cotizaciones-formulario.component.html',
  styleUrls: ['./cotizaciones-formulario.component.scss']
})
export class CotizacionesFormularioComponent implements OnInit {

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingClientes: boolean;
  clientes: ComboBox[];
  cliente: Cliente;
  loadingArticulosCombobox: boolean;
  articulosCombobox: any[];
  listaPrecio: ListaPrecio;
  articulosCotizacion: any[];
  loadingCondicionPagos: boolean;
  TipoCondicionPagos: ComboBox[];
  loadingMonedaTipos: boolean;
  monedaTipos: ComboBox[];

  totalNetoCotizacion: number = 0;
  subTotalCotizacion: number = 0;
  totalDescuentoCotizacion: number = 0;
  totalImpuestoCotizacion: number = 0;

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private router: Router,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    this.CreateForm();
    this.getClientes()
    this.getTipoCondicionPago()
    this.getMonedaTipos()
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      companiaID: [null, Validators.required],
      clienteID: [null, Validators.required],
      codigoReferencia: [null, Validators.required],
      condicionPagoId: [null, Validators.required],
      monedaID: [null, Validators.required],
      descripcion: [null,],
      estadoID: [0,],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html


  onSubmit() {

    console.log(this.articulosCotizacion)

    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
    // this.guardar();
  }


  guardar() {

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<Almacen>(DataApi.Almacen,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/almacen');
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
            console.table(this.cliente)
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

    this.articulosCotizacion = [{}]
    this.limpiarTotales()

  }


  onSelectArticulo(item: any, index: number) {
    this.articulosCotizacion[index].precio = item.precio;
    console.table(item)
    if (!this.articulosCotizacion.some(x => x.id <= 0)) {
      this.articulosCotizacion.push({ "id": 0 })
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
      this.articulosCotizacion.push({ "id": 0 })
    }
    this.calcularTotales()
  }

  calcularTotales() {
    this.limpiarTotales()

    this.articulosCotizacion.forEach(x => {
      x.subTotal = x.cantidad ? (x.precio * x.cantidad) : 0;
      x.totalDescuento = x.descuento ? (x.subTotal * x.descuento / 100) : 0;
      x.totalNeto = x.subTotal - x.totalDescuento;

      this.totalDescuentoCotizacion += x.totalDescuento;
      this.subTotalCotizacion += x.subTotal;
      this.totalNetoCotizacion = this.subTotalCotizacion - this.totalDescuentoCotizacion;

    })
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


  getMonedaTipos() {
    this.loadingMonedaTipos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetMonedas", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.monedaTipos = response.records;
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


}
