import { Proveedor } from './../models/Proveedor';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Cliente } from '../../clientes/models/Cliente';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';
import { Parametro } from 'src/app/core/http/model/Parametro';

@Component({
  selector: 'app-proveedores-formulario',
  templateUrl: './proveedores-formulario.component.html',
  styleUrls: ['./proveedores-formulario.component.scss']
})
export class ProveedoresFormularioComponent implements OnInit {

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

  documentos: ComboBox[];
  loadingDocumentos = false;
  buscandoDocumento: boolean;

  loadingCondicionPagos: boolean;
  TipoCondicionPagos: ComboBox[];

  sectores: any[];
  loadingSectores: boolean;

  loadingCiudades: boolean;
  ciudades: ComboBox[];

  loadingProvincias: boolean;
  provincias: ComboBox[];

  loadingActividadesEconomicas: boolean;
  actividadesEconomicas: ComboBox[];
  loadingPlazos: boolean;
  plazos: ComboBox[];

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    let id = Number(this.route.snapshot.paramMap.get('id'));
    this.CreateForm();

    if (id > 0) {
      this.getItem(id);
      this.actualizando = true;
    }

    this.getProvincias()
    this.getDocumentosTipo();
    this.getTipoCondicionPago();
    this.getActividadEconomica();
    this.getPlazos();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      codigoReferencia: [null,],
      nombres: [null, [Validators.required]],
      apellidos: [null, [Validators.required]],
      documento: [null, [Validators.required, Validators.minLength(9)]],
      documentoTipoID: [1, [Validators.required]], //cedula por defecto
      email: [null, [Validators.required, Validators.email]],

      calle: [null, [Validators.required]],
      numero: [0,],
      sectorID: [0, [Validators.required]],
      ciudadID: [0, [Validators.required]],
      provinciaID: [0, [Validators.required]],
      latitud: [null, []],
      longitud: [null, []],
      limiteCredito: [0],
      registroMercantil: [null, [Validators.required]],
      condicionPagoID: [0, [Validators.required]],

      tipoProveedorID: [0, []],
      actividadEconomicaID: [0],
      monedaID: [0],
      estadoID: [0],
      plazoID: [0],
    },
      {
        validator: cedulaestructura('documento', 'documentoTipoID')
      });
  }


  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Proveedor>(DataApi.Proveedor,
      "GetProveedorByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);

            this.getCiudades();
            this.getSectores();
          } else {
            this.toastService.warning("Proveedor no encontrado");
            this.router.navigateByUrl('/mantenimientos/proveedor');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  onSubmit() {
    console.table(this.Formulario.value)
    this.submitted = true;

    if (this.Formulario.invalid) {
      return;
    }

    if (this.f.numero.value < 1) {
      this.f.numero.setValue(0)
    }

    if (this.f.condicionPagoID.value == 2 && this.f.plazoID.value <= 0) {
      this.toastService.warning("Seleccionar el plazo del pago a crédito.")
      return;
    }


    this.guardar();
  }


  guardar() {

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<Proveedor>(DataApi.Proveedor,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/proveedor');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getDocumentosTipo() {
    this.loadingDocumentos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetDocumentosTipo", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.documentos = response.records;
        }
        this.loadingDocumentos = false;
      }, error => {
        this.loadingDocumentos = false;
        this.toastService.error("No se pudo obtener los documentos", "Error conexion al servidor");

        setTimeout(() => {
          this.getDocumentosTipo()
        }, 1000);

      });
  }


  onDocumentoKeyUp() {

    this.f.nombres.setValue(null);
    this.f.apellidos.setValue(null);
    // this.f.celular.setValue(null);

    if (this.f.documento.valid) {
      this.buscarPadron(this.f.documento.value);
    }
  }


  buscarPadron(documento: string) {
    this.buscandoDocumento = true;

    let parametros = new ParametrosCita();
    parametros.clienteDocumento = documento;

    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteOPadronDatos", parametros).subscribe(response => {

        if (response.ok) {
          if (response != null && response.ok && response.records != null && response.records.length > 0) {
            let cliente = response.records[0];

            this.f.nombres.setValue(cliente.nombres);
            this.f.apellidos.setValue(cliente.apellidos);
            // this.f.celular.setValue(cliente.celular);

          } else {
            this.toastService.warning("Datos no encontrados");
            this.f.nombres.setValue(null);
            this.f.apellidos.setValue(null);
            // this.f.celular.setValue(null);
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


  onProvinciaChange() {
    this.f.ciudadID.setValue(null)
    this.f.sectorID.setValue(null)
    this.sectores = []
    this.getCiudades()
  }

  getProvincias() {
    this.loadingProvincias = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetProvincias", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.provincias = response.records;
        }
        this.loadingProvincias = false;
      }, error => {
        this.loadingProvincias = false;
        this.toastService.error("No se pudo obtener las provincias", "Error conexion al servidor");

        setTimeout(() => {
          this.getProvincias()
        }, 1000);

      });
  }

  getCiudades() {
    let parametros: Parametro[] = [{ key: "ProvinciaId", value: this.f.provinciaID.value }]
    this.loadingCiudades = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetCiudades", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.ciudades = response.records;
        }
        this.loadingCiudades = false;
      }, error => {
        this.loadingCiudades = false;
        this.toastService.error("No se pudo obtener las ciudades", "Error conexion al servidor");

        setTimeout(() => {
          this.getCiudades()
        }, 1000);

      });
  }

  getSectores() {
    let parametros: Parametro[] = [{ key: "ciudadId", value: this.f.ciudadID.value }]
    this.loadingSectores = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSectores", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sectores = response.records;
        }
        this.loadingSectores = false;
      }, error => {
        this.loadingSectores = false;
        this.toastService.error("No se pudo obtener los sectores", "Error conexion al servidor");

        setTimeout(() => {
          this.getSectores()
        }, 1000);

      });
  }


  getActividadEconomica() {
    this.loadingActividadesEconomicas = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetActividadEconomica", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.actividadesEconomicas = response.records;
        }
        this.loadingActividadesEconomicas = false;
      }, error => {
        this.loadingActividadesEconomicas = false;
        this.toastService.error("No se pudo obtener las actividadesEconomicas", "Error conexion al servidor");

        setTimeout(() => {
          this.getActividadEconomica()
        }, 1000);

      });
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



}
