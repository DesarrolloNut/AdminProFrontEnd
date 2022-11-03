import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { SintomaViewModel } from '../../citas/model/SintomaViewModel';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { Cita } from '../../citas/model/Cita';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WebcamImage } from 'ngx-webcam';
import { Accesorio } from '../models/Accesorio';
import { AlertaTablero } from '../models/AlertaTablero';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { CitaEstadoEnum } from 'src/app/shared/enums/CitaEstadoEnum';
import { Orden } from '../models/Orden';
import { OrdenListadoViewModel } from '../../ordenes/models/OrdenListadoViewModel';

@Component({
  selector: 'app-recepcion-edit',
  templateUrl: './recepcion-edit.component.html',
  styleUrls: ['./recepcion-edit.component.scss']
})
export class RecepcionEditComponent implements OnInit {

  //CITA
  FormularioCita: FormGroup;
  submitted = false;

  clientes: ComboBox[] = [];
  vehiculos: ComboBox[] = [];
  citaTipos: ComboBox[] = [];
  servicios: ComboBox[] = [];
  sucursales: ComboBox[] = [];
  horasDisponibles: ComboBox[] = [];
  sintomasCita: SintomaViewModel[] = [];
  citaCategorias: ComboBox[] = [];

  sintomas: ComboBox[][] = [];
  sintomaCategorias: ComboBox[] = [];

  loadingClientes = false;
  loadingVehiculos = false;
  loadingHorasCita = false;
  loadingServicios = false;
  loadingSucursales = false;
  loadingSintomas = false;
  loadingCategoriasSintomas = false;
  loadingCategoriasCitas = false;
  Cargando: boolean = false;
  loadingSintomasRegistrados = false;
  loadingSintomaCategorias = false;

  //RECEPCION

  FormularioClienteRecepcion: FormGroup;

  accesorios: Accesorio[] = [];
  asesores: ComboBox[];
  alertasTablero: AlertaTablero[];
  tags: ComboBox[];

  sintomasSolicitud: ComboBox[];

  readonly CANTIDAD_IMAGENES: number = 14;
  readonly MILLA_A_KM: number = 1.60934;
  unidadMedidaKMSeleccionada: string = "km";

  imagenes: WebcamImage[] = [];
  anguloCamaraSeleccionado: number = 0;
  imagenSeleccionada: WebcamImage = null;

  signatureImage;
  primeraFirmaRegistradaVacia
  firmaYaRegistrada: boolean = false

  public buscandoDocumento: boolean;
  public documentos: ComboBox[] = [];

  btnGuardarCargando = false;

  citaEstado = CitaEstadoEnum
  loadingSintomasSolicitud: boolean;

  vehiculoTieneAlertaMantenimiento: boolean;
  cargandoAlertaMantenimiento: boolean;


  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.CreateForms();
    this.getClientes();
    this.getSintomaCategorias();
    this.getSucursales();
    this.getServicios();
    this.getCitaCategoriasComboBox();

    //RECEPCION
    this.getAsesores();
    this.getAccesorios();
    this.getAlertasTablero();
    this.getTags();
    this.getDocumentosTipo();
    this.getCitaSintomaTipoSolicitud()

    let citaID = Number(this.route.snapshot.paramMap.get('id'));

    this.getCitaByIDForEdit(citaID);

  }

  private CreateForms() {

    this.FormularioCita = this.formBuilder.group({
      id: [0],
      citaTipoID: [0, [Validators.required]],
      sucursalID: [0, [Validators.required]],
      usuarioCreadorID: [Number(this.authService.tokenDecoded.nameid)],
      clienteID: [null, [Validators.required]],
      fechaRegistro: [null],
      fechaRecepcion: [null],
      fechaCita: [null, [Validators.required]],
      horaCita: [null, [Validators.required]],
      servicioTipoID: [null, [Validators.required]],
      vehiculoID: [null, [Validators.required]],
      usuarioRecibeID: [0, [Validators.required]],
      observaciones: [''],
      estadoID: [1],
      asesorID: [0, [Validators.required]],
      kilometraje: [null, [Validators.required, Validators.min(0)]],
      combustible: [null, [Validators.required]],
      tagID: [null, [Validators.required]],
      origenCitaID: [0],
      categoriaID: [0, [Validators.required]],
    });



    this.FormularioClienteRecepcion = this.formBuilder.group({
      documentoTipoID: [1, Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      celular: ['', Validators.required],
      documento: ['', [Validators.required, Validators.minLength(9)]],
    }, {
      validator: cedulaestructura('documento', 'documentoTipoID')
    });


  }

  get f() { return this.FormularioCita.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  get fc() { return this.FormularioClienteRecepcion.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html



  getCitaByIDForEdit(citaID: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Cita>(DataApi.Cita,
      "GetCitaByID", citaID).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let cita = response.records[0];
            this.FormularioCita.setValue(cita);
            this.getVehiculosByCliente(cita.clienteID);
            this.getClientes('', response.records[0].clienteID);
            this.getSintomasByCitaID(citaID);
          } else {
            this.toastService.warning("Cita no encontrada");
            this.router.navigateByUrl('/servicios/citas');
          }
        }

      }, error => {
        this.Cargando = false;
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

  getSucursales() {
    this.loadingSucursales = true;
    let parametros: Parametro[] = [
      { key: "CompaniaID", value: this.authService.tokenDecoded.primarygroupsid }
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
        this.toastService.error("Error conexion al servidor");
      });
  }

  getServicios() {
    this.loadingServicios = true;

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetServiciosComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.servicios = response.records;
        }

        this.loadingServicios = false;
      }, error => {
        this.loadingServicios = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getCitaCategoriasComboBox() {
    this.loadingCategoriasCitas = true;

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetCitaCategoriasComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.citaCategorias = response.records;
        }
        this.loadingCategoriasCitas = false;

      }, error => {
        this.loadingCategoriasCitas = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getSintomaCategorias() {
    this.loadingSintomaCategorias = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSintomaCategoriasComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sintomaCategorias = response.records;
          let categoriaOtros = new ComboBox()
          categoriaOtros.codigo = 0
          categoriaOtros.nombre = 'Otros'
          this.sintomaCategorias.unshift(categoriaOtros)
        }
        this.loadingSintomaCategorias = false;
      }, error => {
        this.loadingSintomaCategorias = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        setTimeout(() => {
          this.getSintomaCategorias()
        }, 1000);

      });
  }

  GetSintomasByCategoriaID(categoriaID: number, index: number) {

    this.sintomasCita[index].sintomaID = null;
    this.sintomasCita[index].descripcion = null;

    this.loadingSintomas = true;

    let parametros: Parametro[] = [
      { key: "categoriaID", value: categoriaID }
    ];

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSintomasByCategoriaID", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sintomas[index] = response.records;
        }
        this.loadingSintomas = false;

      }, error => {
        this.loadingSintomas = false;
        this.toastService.error("Error conexion al servidor");
      });

  }


  onSintomaChange(sintoma: ComboBox, index: number) {
    this.sintomasCita[index].sintomaID = sintoma.codigo
  }

  getSintomasByCitaID(citaID: number) {
    this.loadingSintomasRegistrados = true;
    this.httpService.DoPostAny<SintomaViewModel>(DataApi.Sintoma,
      "GetSintomasByCitaID", citaID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sintomasCita = response.records;
          console.table(this.sintomasCita)
        }
        this.loadingSintomasRegistrados = false;

      }, error => {
        this.loadingSintomasRegistrados = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getVehiculosByCliente(clienteID: number) {
    this.loadingVehiculos = true;

    this.httpService.DoPostAny<ComboBox>(DataApi.ComboBox,
      "GetChasisPorCliente", clienteID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.vehiculos = response.records;
        }

        this.loadingVehiculos = false;
      }, error => {
        this.loadingVehiculos = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  onAddSintoma() {
    this.sintomasCita.push(new SintomaViewModel());
  }

  onDeleteSintoma(index: number) {
    this.sintomasCita.splice(index, 1);
  }




  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION
  //RECEPCION


  getCitaSintomaTipoSolicitud() {
    this.loadingSintomasSolicitud = true;
    // let parametros: Parametro[] = [{ key: "citaID", value: 0 }];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetCitaSintomaTipoSolicitud", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sintomasSolicitud = response.records;
        }

        this.loadingSintomasSolicitud = false;
      }, error => {
        setTimeout(() => {
          this.getCitaSintomaTipoSolicitud()
        }, 1000);
        this.loadingSintomasSolicitud = false;
        this.toastService.error("Sintoma solicitud", "Error conexion al servidor");
      });
  }

  getAccesorios() {
    this.Cargando = true;
    let parametros: Parametro[] = [{ key: "citaID", value: 0 }];
    this.httpService.DoPost<Accesorio>(DataApi.Accesorio,
      "GetAccesorios", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.accesorios = response.records;
        }

        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getAsesores() {
    this.Cargando = true;
    let parametros: Parametro[] = [{
      key: "sucursalID",
      value: this.authService.tokenDecoded.groupsid
    }];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetAsesoresComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.asesores = response.records;
        }

        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getAlertasTablero() {
    this.Cargando = true;
    let parametros: Parametro[] = [{ key: "citaID", value: 0 }];
    this.httpService.DoPost<AlertaTablero>(DataApi.AlertaTablero,
      "GetAlertasTablero", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.alertasTablero = response.records;
        }

        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getTags() {
    this.Cargando = true;
    let parametros: Parametro[] = [{
      key: "sucursalID",
      value: this.authService.tokenDecoded.groupsid
    }];

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTagsComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.tags = response.records;
        }

        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  //firma del cliente


  showImage(data) {

    this.signatureImage = data;

    if (!this.firmaYaRegistrada) {
      this.primeraFirmaRegistradaVacia = data;
      this.firmaYaRegistrada = true;
    }
  }

  clear(event: any) {
    this.signatureImage = this.primeraFirmaRegistradaVacia
    return false;
  }



  //fotos de la recepcion

  //al darle clic al boton de la camara del vehiculo
  openLg(content, angulo: number) {
    this.anguloCamaraSeleccionado = angulo;
    this.setImagen();
    this.modalService.open(content, { size: 'lg' });
  }

  //cuando tiran la foto
  handleImage(webcamImage: WebcamImage) {
    // for (let i = 0; i < this.CANTIDAD_IMAGENES; i++) {
    //   this.imagenes[i] = webcamImage
    // }
    this.imagenes[this.anguloCamaraSeleccionado] = webcamImage;
  }

  deleteFoto() {
    this.handleImage(null);
  }

  //Seteo la foto en el modal segun el angulo seleccionado
  setImagen() {
    this.imagenSeleccionada = this.imagenes[this.anguloCamaraSeleccionado];

  }



  validarTodasFotosTomadas(): boolean {
    for (var i = 0; i < this.CANTIDAD_IMAGENES; i++) {
      if (this.imagenes[i] == null) {
        return false;
      }
    }

    return true;

  }

  onDocumentoKeyUp() {

    this.fc.nombres.setValue(null);
    this.fc.apellidos.setValue(null);
    this.fc.celular.setValue(null);

    if (this.fc.documento.valid) {

      this.buscarCliente(this.fc.documento.value);
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
            let cliente = response.records[0];

            this.fc.nombres.setValue(cliente.nombres);
            this.fc.apellidos.setValue(cliente.apellidos);
            // this.fc.celular.setValue(cliente.celular);

          } else {
            this.toastService.warning("Cliente no encontrado");
            this.fc.nombres.setValue(null);
            this.fc.apellidos.setValue(null);
            this.fc.celular.setValue(null);
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

  getDocumentosTipo() {
    this.Cargando = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetDocumentosTipo", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.documentos = response.records;
        }
        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  validaVehiculoTieneAlertaMantenimiento() {
    let kilometraje = ''

    if (!(this.f.kilometraje.value > 0)) {
      this.f.kilometraje.setValue(0)
    }

    if (this.unidadMedidaKMSeleccionada == "mi") {
      kilometraje = (this.f.kilometraje.value * this.MILLA_A_KM) + '';
    } else {
      kilometraje = this.f.kilometraje.value + ''
    }

    kilometraje = Math.round(Number(kilometraje)) + ''

    this.cargandoAlertaMantenimiento = true;
    let parametros = new ParametrosCita();
    let vehiculoId = Number(this.f.vehiculoID.value)
    parametros.servicioID = vehiculoId
    parametros.clienteDocumento = kilometraje

    this.httpService.DoPostAny<any>(DataApi.Recepcion,
      "VehiculoLlevaMantenimiento", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.vehiculoTieneAlertaMantenimiento = response.valores[0];
        }
        this.cargandoAlertaMantenimiento = false;
      }, error => {
        this.cargandoAlertaMantenimiento = false;
        this.toastService.error("Valida Vehiculo Alerta Mantenimiento", "Error conexion al servidor");

        setTimeout(() => {
          this.validaVehiculoTieneAlertaMantenimiento()
        }, 1000);
      });
  }


  onSubmit() {

    this.submitted = true;

    if (this.sintomasCita.some(x => x.tipoSolicitudID <= 0)) {
      this.toastService.warning("Completa la información de los sintomas", "Validación")
      return;
    }

    if (this.sintomasCita.length == 0) {
      this.toastService.warning("Agrega uno o más sintomas", "Validación")
      return;
    }

    //asesor viene de c# con 0, hay que ponerlo nulo para que angular ponga el form invalid
    if (this.f.asesorID.value == 0) {
      this.f.asesorID.setValue(null);
    }

    //tagID viene de c# con 0, hay que ponerlo nulo para que angular ponga el form invalid
    if (this.f.tagID.value == 0) {
      this.f.tagID.setValue(null);
    }

    if (this.FormularioCita.invalid || this.FormularioClienteRecepcion.invalid) {
      this.toastService.warning("Complete todos los datos.");
      return;
    }
    //Validar que todas las fotos se han tomado
    if (!this.validarTodasFotosTomadas()) {
      this.toastService.warning("Debes de tomar todas las fotos.");
      return;
    }
    //Validar que se ha firmado
    if (this.signatureImage == this.primeraFirmaRegistradaVacia) {
      this.toastService.warning("La firma es obligatoria");
      return false;
    }

    this.guardarDatosRecepcion();
  }


  guardarDatosRecepcion() {

    //convertir de millas a km
    if (this.unidadMedidaKMSeleccionada == "mi") {
      this.f.kilometraje.setValue(this.f.kilometraje.value * this.MILLA_A_KM);
    }

    //le asigno el receptor
    this.f.usuarioRecibeID.setValue(Number(this.authService.tokenDecoded.nameid))

    this.btnGuardarCargando = true;

    let clienteEntregaVehiculo = new Cliente();
    clienteEntregaVehiculo.documentoTipoID = Number(this.fc.documentoTipoID.value)
    // clienteEntregaVehiculo.celular = this.fc.celular.value + ""
    clienteEntregaVehiculo.nombres = this.fc.nombres.value
    clienteEntregaVehiculo.apellidos = this.fc.apellidos.value
    clienteEntregaVehiculo.documento = this.fc.documento.value
    clienteEntregaVehiculo.fechaNacimiento = new Date
    clienteEntregaVehiculo.fechaRegistrado = new Date
    let parametro = {
      "Cita": this.FormularioCita.value,
      "Sintomas": this.sintomasCita,
      "Imagenes": this.imagenes,
      "Accesorios": this.getAccesoriosSeleccionados(),
      "Alertas": this.alertasTablero.filter(a => a.value),
      "ClienteEntregaVehiculo": {},
      "ClienteEntregaFirma": this.signatureImage,
    }
    console.log(parametro)
    this.httpService.DoPostAny<Cita>(DataApi.Recepcion,
      "GuardarRecepcion", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          this.btnGuardarCargando = false;
        } else {
          let recepcion = response.valores[0]
          this.deshabilitarRecallsAutorizados()
          this.enviarDatosASmart(recepcion);
          // this.toastService.success("Operacion realizada.", "Recepción");
          this.router.navigateByUrl("/consultas/orden-servicio/" + recepcion.idCita);
        }

        // this.btnGuardarCargando = false;

      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });

  }

  enviarDatosASmart(recepcionForSmart) {
    this.btnGuardarCargando = true;

    recepcionForSmart.sintomas = JSON.stringify(recepcionForSmart.sintomas);
    console.log(recepcionForSmart)

    this.httpService.DoPostSmartWebService("InsertaServicioscitas", "inserta_cita_servicios", recepcionForSmart).subscribe(response => {
      let mensajeRespuesta = response.d + '';
      console.log(response.d)

      if (mensajeRespuesta.includes("Error")) {
        this.btnGuardarCargando = false;
        this.toastService.error(mensajeRespuesta, "Smart Servicio");
        return;
      }

      this.toastService.success("Operacion realizada.", "Smart Servicio");
      this.buscarCodigoReferenciaOrdenSmart(Number(recepcionForSmart.idCita));
      // this.router.navigateByUrl("servicios/recepcion-llamado");

    }, error => {
      this.btnGuardarCargando = false;
      console.error(error)
      this.toastService.error("Error conexion al servidor", "Smart Servicio");
    });


  }

  buscarCodigoReferenciaOrdenSmart(citaID) {
    console.log(citaID)

    this.httpService.DoPostSmartWebService("OrdenRecepcion", "Ordenrecepcion", { "Idcita": citaID }).subscribe(response => {
      let mensajeRespuesta = response.d + '';
      console.log(response.d)

      if (mensajeRespuesta.includes("Error")) {
        this.btnGuardarCargando = false;
        this.toastService.error(mensajeRespuesta, "Smart Servicio");
        return;
      }
      this.toastService.success("Código de orden obtenido.", "Smart Servicio");
      this.asignarCodigoReferenciaOrden(Number(citaID), mensajeRespuesta);

    }, error => {
      this.btnGuardarCargando = false;
      console.error(error)
      this.toastService.error("Error conexion al servidor", "Smart Servicio");
    });
  }


  asignarCodigoReferenciaOrden(citaID: number, codigoReferencia: string) {


    let orden = new Orden();
    orden.citaID = citaID;
    orden.ordenReferencia = codigoReferencia;

    // this.loadingBtnGuardarTecnico = true;

    this.httpService.DoPostAny<OrdenListadoViewModel>(DataApi.Recepcion,
      "AsignarCodigoOrdenReferenciaSmart", orden).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Código de orden asignado", "OK");
        }

        // this.loadingBtnGuardarTecnico = false;
      }, error => {
        // this.loadingBtnGuardarTecnico = false;
        this.toastService.error("Asignar CodigoReferencia Orden", "Error conexion al servidor");
      });
  }



  getAccesoriosSeleccionados(): Accesorio[] {
    let accesoriosCheck = this.accesorios.filter(a => a.inputType == 'checkbox' && a.inputValue == true);
    let accesoriosNumber = this.accesorios.filter(a => a.inputType == 'number' && a.inputValue > '0');
    let AllAccesorios = accesoriosCheck.concat(accesoriosNumber);

    AllAccesorios.forEach(a => a.inputValue = a.inputValue + "");
    return AllAccesorios;
  }


  deshabilitarRecallsAutorizados() {
    let recallsAutorizados = this.sintomasCita.filter(x => x.categoriaID == 20 && x.tipoSolicitudID == 1);
    let parametros = { "chasisID": Number(this.f.vehiculoID.value), "recalls": recallsAutorizados }

    if (recallsAutorizados.length == 0) return;

    this.httpService.DoPostAny<any>(DataApi.Recall,
      "DeshabilitarRecallsAutorizados", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.toastService.info("Recalls autorizados deshabilitados.");
        }

      }, error => {
        this.toastService.error("Error conexion al servidor", "Al deshabilitar los recalls autorizados.");
        console.error(error);
      });

  }

}
