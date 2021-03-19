import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { Sucursal } from 'src/app/Modules/mantenimientos/sucursales/models/Sucursal';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';

@Component({
  selector: 'app-ofertas-consultas-facturas',
  templateUrl: './ofertas-consultas-facturas.component.html',
  styleUrls: ['./ofertas-consultas-facturas.component.scss']
})
export class OfertasConsultasFacturasComponent implements OnInit {

  Cargando: boolean = false;
  cargandoCliente: boolean = false;
  Formulario: FormGroup;
  submitted = false;

  clientes: ComboBox[] = [];
  loadingClientes = false;
  cliente: Cliente;
  sucursal: Sucursal;
  loadingTiposPago: boolean;
  tiposPago: ComboBox[];
  documentos: ComboBox[];
  loadingDocumentosTipo: boolean;
  buscandoDocumento: boolean;

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.CreateForm();
    let sucursalID = Number(this.authService.tokenDecoded.groupsid)
    this.getSucursal(sucursalID)
    this.getTiposPago()
    this.getDocumentosTipo()
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      facturaNum: [null, [Validators.required]],
      tipoPago: [null, [Validators.required]],
      documentoTipoID: [1, Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      celular: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      documento: ['', [Validators.required, Validators.minLength(9)]],
    }, {
      validator: cedulaestructura('documento', 'documentoTipoID')
    });

  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html


  onSubmit() {

    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
    // this.guardarOfertaCapturada()
    this.consultarFacturaSmart()

  }

  consultarFacturaSmart() {

    let parametros = {
      "sucursal": this.sucursal.referencia,
      "tipo": this.f.tipoPago.value,
      "factura": this.f.facturaNum.value,
      "cedula": this.f.documento.value,
      "correo": this.f.email.value,
      "telefono": this.f.celular.value,
      "cliente": this.f.nombres.value + ' ' + this.f.apellidos.value,
    }

    console.table(parametros)

    this.Cargando = true;
    this.httpService.DoPostSmartWebService("ofertas", "TicketOfertas", parametros).subscribe(response => {
      let mensajeRespuesta = response.d + '';
      console.log(response)

      if (mensajeRespuesta.includes("Error")) {
        this.Cargando = false;
        this.toastService.error(mensajeRespuesta, "Smart Servicio");
        return;
      }

      let resultados: any[] = JSON.parse(response.d);
      console.log(resultados)
      if (!resultados || resultados.length == 0) {
        this.Cargando = false;
        this.toastService.error("Esta factura no aplica.", "Smart Servicio");
        return;
      }
      this.toastService.info("Resultados obtenidos de Smart.", "Smart Servicio")
      this.guardarResultadoConsulta(resultados);
      console.table(resultados)

    }, error => {
      this.Cargando = false;
      console.error(error)
      this.toastService.error("Error conexion al servidor", "Smart Servicio");
    });


  }

  guardarResultadoConsulta(resultados: any[]) {
    this.httpService.DoPostAny<any>(DataApi.Oferta,
      "RegistrarOfertaResultadosSmart", resultados).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Factura es válida, correo enviado al cliente.", "OK");
          this.router.navigateByUrl("/consultas/oferta-resultados/" + resultados[0].FACTURA);
          // this.Formulario.reset()
          // this.router.navigateByUrl('/mantenimientos/oferta');
        }

        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  onDocumentoKeyUp() {

    this.f.nombres.setValue(null);
    this.f.apellidos.setValue(null);
    this.f.celular.setValue(null);

    if (this.f.documento.valid) {

      this.buscarCliente(this.f.documento.value);
    }
  }


  buscarCliente(documento: string) {
    this.buscandoDocumento = true;

    let parametros = new ParametrosCita();
    parametros.clienteDocumento = documento;

    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteOPadronDatos", parametros).subscribe(response => {

        if (response.ok) {
          if (response != null && response.ok && response.records != null && response.records.length > 0) {
            this.cliente = response.records[0];

            this.f.nombres.setValue(this.cliente.nombres);
            this.f.apellidos.setValue(this.cliente.apellidos);
            // this.f.celular.setValue(this.cliente.celular);

          } else {
            this.toastService.warning("Cliente no encontrado");
            this.f.nombres.setValue(null);
            this.f.apellidos.setValue(null);
            this.f.celular.setValue(null);
          }

        } else {
          this.toastService.error(response.errores[0]);
        }

        this.buscandoDocumento = false;
      }, error => {
        this.buscandoDocumento = false;
        this.toastService.error("Error conexion al servidor");
      });

  }

  guardarOfertaCapturada() {
    this.httpService.DoPostAny<any>(DataApi.Oferta,
      "RegistrarOfertaCapturada", this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.toastService.success("Oferta capturada registrada.")
        }

      }, error => {
        this.toastService.error("Error conexion al servidor");
      });
  }

  getSucursal(id: number) {
    this.httpService.DoPostAny<Sucursal>(DataApi.Sucursal,
      "GetSucursalByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            this.sucursal = response.records[0]
          } else {
            this.toastService.warning("Sucursal no encontrada");
          }
        }

      }, error => {
        setTimeout(() => {
          this.getSucursal(id)
        }, 1000);
        this.toastService.error("Error conexion al servidor");
      });
  }


  getTiposPago() {
    this.loadingTiposPago = true;

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTiposPago", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.tiposPago = response.records;
        }
        this.loadingTiposPago = false;
      }, error => {
        this.loadingTiposPago = false;
        this.toastService.error("No se pudo obtener los tipos de pago", "Error conexion al servidor");

        setTimeout(() => {
          this.getTiposPago()
        }, 1000);

      });
  }


  getDocumentosTipo() {
    this.loadingDocumentosTipo = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetDocumentosTipo", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.documentos = response.records;
        }
        this.loadingDocumentosTipo = false;
      }, error => {
        this.loadingDocumentosTipo = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



}
