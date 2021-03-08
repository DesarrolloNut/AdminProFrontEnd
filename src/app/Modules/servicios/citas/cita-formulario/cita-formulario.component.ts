import { Component, OnInit, AfterViewInit, AfterContentChecked, AfterViewChecked } from '@angular/core';
import { ComboBox } from '../../../../shared/model/ComboBox';
import { SintomaViewModel } from '../model/SintomaViewModel';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from '../../../../core/http/service/backend.service';
import { AuthenticationService } from '../../../../core/authentication/service/authentication.service';
import { Parametro } from '../../../../core/http/model/Parametro';
import { DataApi } from '../../../../shared/enums/DataApi.enum';
import { Cita } from '../model/Cita';
import { CitaSintomasRequestModel } from '../model/CitaSintomasRequestModel';
import { ToastrService } from 'ngx-toastr';
import { CitaTipoEnum } from 'src/app/shared/enums/CitaTipoEnum';
import { CitaOrigen } from 'src/app/shared/enums/CitaOrigen';
import { RecallListadoViewModel } from 'src/app/Modules/mantenimientos/recall/models/RecallListadoViewModel';

@Component({
    selector: 'app-cita-formulario',
    templateUrl: './cita-formulario.component.html',
    styleUrls: ['./cita-formulario.component.css']
})
export class CitaFormularioComponent implements OnInit {


    clientes: ComboBox[] = [];
    vehiculos: ComboBox[] = [];
    citaTipos: ComboBox[] = [];
    servicios: ComboBox[] = [];
    sucursales: ComboBox[] = [];
    horasDisponibles: ComboBox[] = [];
    sintomas: ComboBox[][] = [];
    sintomaCategorias: ComboBox[] = [];
    sintomasCita: any[] = [];
    citaCategorias: ComboBox[] = [];


    Cargando: boolean = false;
    Formulario: FormGroup;
    submitted = false;
    actualizandoCita = false;
    seHaModificadoHora = false;
    btnGuardarCargando = false;


    loadingClientes = false;
    loadingVehiculos = false;
    loadingHorasCita = false;
    loadingServicios = false;
    loadingSucursales = false;
    loadingSintomas = false;
    loadingSintomasRegistrados = false;
    loadingSintomaCategorias = false;
    loadingCategoriasCitas = false;

    fechaActual: Date;
    citaTipo = CitaTipoEnum
    citaOrigen = CitaOrigen
    asesores: ComboBox[];
    loadingAsesores: boolean;
    recalls: RecallListadoViewModel[] = [];
    loadingRecalls: boolean;


    constructor(
        private toastService: ToastrService,
        private route: ActivatedRoute,
        private httpService: BackendService,
        private router: Router,
        private authService: AuthenticationService,
        private formBuilder: FormBuilder) { }

    ngOnInit() {
        this.CreateForm();
        this.getClientes();
        this.getAsesores()
        this.getSintomaCategorias();
        this.getSucursales();
        this.getServicios();
        this.getCitaCategoriasComboBox();
        this.getHoraActual();
        let citaID = Number(this.route.snapshot.paramMap.get('id'));

        if (citaID > 0) {
            this.getCitaByIDForEdit(citaID);
            this.actualizandoCita = true;

        } else {
            this.sintomasCita.push(new SintomaViewModel());
        }

    }


    private CreateForm() {

        this.Formulario = this.formBuilder.group({
            id: [0],
            citaTipoID: [this.citaTipo.RESERVADA, [Validators.required]],
            sucursalID: [null, [Validators.required]],
            usuarioCreadorID: [Number(this.authService.tokenDecoded.nameid)],
            clienteID: [null, [Validators.required]],
            fechaRegistro: [null],
            fechaRecepcion: [null],
            fechaCita: [null, [Validators.required]],
            horaCita: [null, [Validators.required]],
            servicioTipoID: [null, [Validators.required]],
            vehiculoID: [null, [Validators.required]],
            usuarioRecibeID: [0],
            observaciones: [''],
            estadoID: [1],
            asesorID: [0],
            kilometraje: [0],
            combustible: [null],
            tagID: [0],
            origenCitaID: [0],
            categoriaID: [0, [Validators.required]],
        });

    }

    get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html


    onSubmit() {

        this.submitted = true;
        if (this.Formulario.invalid) {
            return;
        }

        // if (this.sintomasCita.some(x => x.sintomaID <= 0 || x.categoriaID <= 0)) {
        //     this.toastService.warning("Completa la información de los sintomas", "Validación")
        //     return;
        // }


        this.guardarCitaySintomas();
    }

    guardarCitaySintomas() {
        let metodo: string = this.actualizandoCita ? "UpdateCita" : "CrearCita";
        this.btnGuardarCargando = true;
        this.f.origenCitaID.setValue(this.citaOrigen.ERP)
        this.f.asesorID.setValue(Number(this.f.asesorID.value))

        let sintomas = this.sintomasCita.map(x => {
            let sintoma: SintomaViewModel = {
                sintomaID: Number(x.sintomaID),
                categoriaID: x.categoriaID,
                tipoSolicitudID: x.tipoSolicitudID,
                citaID: x.citaID,
                nombre: x.nombre,
                descripcion: x.descripcion,
                codigoReferencia: x.codigoReferencia,
            }
            return sintoma;
        });

        if (this.recalls.length > 0) {
            this.recalls.forEach(x => {
                sintomas.unshift({
                    categoriaID: x.sintomaCategoriaID,
                    citaID: 0,
                    codigoReferencia: x.sintomaCodigoReferencia,
                    descripcion: x.sintoma,
                    nombre: "",
                    sintomaID: x.sintomaID,
                    tipoSolicitudID: 0
                })
            })
        }


        let parametros: CitaSintomasRequestModel = {
            "cita": this.Formulario.value,
            "sintomas": sintomas
        }

        this.httpService.DoPostAny<Cita>(DataApi.Cita,
            metodo, parametros).subscribe(response => {

                if (!response.ok) {
                    this.toastService.error(response.errores[0]);
                } else {
                    this.toastService.success("Realizado", "OK");

                    this.router.navigateByUrl('/servicios/citas');
                }

                this.btnGuardarCargando = false;
            }, error => {
                this.btnGuardarCargando = false;
                this.toastService.error("Error conexion al servidor");
            });
    }

    getCitaByIDForEdit(citaID: number) {
        this.Cargando = true;
        this.httpService.DoPostAny<Cita>(DataApi.Cita,
            "GetCitaByID", citaID).subscribe(response => {
                if (!response.ok) {
                    this.toastService.error(response.errores[0]);
                } else {
                    //validar que existe
                    if (response != null && response.records != null && response.records.length > 0) {
                        this.Formulario.setValue(response.records[0]);
                        this.getVehiculosByCliente(response.records[0].clienteID);
                        this.getClientes('', response.records[0].clienteID);
                        this.getSintomasByCitaID(citaID);
                        this.getHorasDisponibles(this.f.horaCita.value);
                        this.actualizandoCita = true;
                        console.table(response.records[0])
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

    getSintomaCategorias() {
        this.loadingSintomaCategorias = true;
        this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
            "GetSintomaCategoriasComboBox", null).subscribe(response => {

                if (!response.ok) {
                    this.toastService.error(response.errores[0]);
                } else {
                    this.sintomaCategorias = response.records;
                    // let categoriaOtros = new ComboBox()
                    // categoriaOtros.codigo = 0
                    // categoriaOtros.nombre = 'Otros'
                    // this.sintomaCategorias.unshift(categoriaOtros)
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

    onSintomaCategoriasChange(categoria: ComboBox, index: number) {

        this.GetSintomasByCategoriaID(categoria.codigo, index);
        if (categoria.nombre.toLowerCase().startsWith("otro")) {
            this.sintomasCita[index].mostrarInputText = true;
        }
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

    onSelectSucursal() {
        this.f.fechaCita.setValue(null)
        this.f.horaCita.setValue(null)
        this.horasDisponibles = []
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

    getSintomasByCitaID(citaID: number) {
        this.loadingSintomasRegistrados = true;
        this.httpService.DoPostAny<SintomaViewModel>(DataApi.Sintoma,
            "GetSintomasByCitaID", citaID).subscribe(response => {

                if (!response.ok) {
                    this.toastService.error(response.errores[0]);
                } else {
                    this.sintomasCita = response.records;
                }
                this.loadingSintomasRegistrados = false;

            }, error => {
                this.loadingSintomasRegistrados = false;
                this.toastService.error("Error conexion al servidor");
            });
    }

    onSelectVehiculo(vehiculo: ComboBox) {

        this.recalls = []

        if (vehiculo && vehiculo.codigo > 0) {
            this.getRecalls(vehiculo.codigo)
        }

    }

    getRecalls(articuloID: number) {
        this.loadingRecalls = true;
        this.httpService.DoPostAny<RecallListadoViewModel>(DataApi.Recall,
            "GetRecallsPendientesByVehiculoID", articuloID).subscribe(response => {

                if (!response.ok) {
                    this.toastService.error(response.errores[0]);
                } else {
                    this.recalls = response.records;
                    console.table(this.recalls)
                }
                this.loadingRecalls = false;

            }, error => {
                this.loadingRecalls = false;
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

    dateTimeChange(event) {
        if (event.isInteracted) {
            this.f.horaCita.setValue(null);
        }
        this.getHorasDisponibles(new Date(event.value));
    }

    getHorasDisponibles(fecha) {

        if (!this.f.sucursalID.value) {
            this.toastService.warning("Para obtener las horas debe seleccionar la sucursal.");
            return
        }

        this.loadingHorasCita = true;
        let parametros: Parametro[] = [
            { key: "sucursalID", value: this.f.sucursalID.value },
            { key: "fechaCita", value: fecha }];
        this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
            "GetHorasDisponiblesCita", parametros).subscribe(response => {

                if (!response.ok) {
                    this.toastService.error(response.errores[0]);
                } else {
                    this.horasDisponibles = response.records;
                }
                this.loadingHorasCita = false;
            }, error => {
                this.loadingHorasCita = false;
                this.toastService.error("Error conexion al servidor");
            });
    }

    getAsesores() {
        this.loadingAsesores = true;
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

                this.loadingAsesores = false;
            }, error => {
                this.loadingAsesores = false;
                this.toastService.error("Error conexion al servidor");
            });
    }


    onSelectCliente(cliente: ComboBox) {
        this.f.vehiculoID.setValue(null);
        this.vehiculos = [];
        if (cliente != null) {
            this.getVehiculosByCliente(cliente.codigo);
        }
    }

    onClearCliente(cliente: ComboBox) {
        this.f.clienteID.reset();
        this.f.vehiculoID.reset();
    }


    onAddSintoma() {
        this.sintomasCita.push(new SintomaViewModel());
    }

    onDeleteSintoma(index: number) {
        this.sintomasCita.splice(index, 1);
    }





}
