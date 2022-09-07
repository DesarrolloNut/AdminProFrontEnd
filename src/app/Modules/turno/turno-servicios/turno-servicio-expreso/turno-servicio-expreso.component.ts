import { Component, OnInit, } from '@angular/core';
import Stepper from 'bs-stepper';
import { TecladoLayOuts } from 'src/app/shared/enums/TecladoLayouts';
import { TipoDocumento } from 'src/app/shared/enums/TipoDocumento';
import { ValidatorLogic } from 'src/app/shared/validators/ValidatorLogic';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ParametrosCita } from '../../models/ParametrosCita';
import { CitaTurnoViewModel } from '../../models/CitaTurnoViewModel';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Turno } from '../../models/Turno';
import { Servicios } from 'src/app/shared/enums/Servicios';
import { Cita } from 'src/app/Modules/servicios/citas/model/Cita';
import { Router } from '@angular/router';
import { TurnoViewModel } from '../../models/TurnoViewModel';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { CitaEstadoEnum } from 'src/app/shared/enums/CitaEstadoEnum';
import { CitaTipoEnum } from 'src/app/shared/enums/CitaTipoEnum';
import { CitaOrigen } from 'src/app/shared/enums/CitaOrigen';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

@Component({
  selector: 'app-turno-servicio-expreso',
  templateUrl: './turno-servicio-expreso.component.html',
  styleUrls: ['./turno-servicio-expreso.component.scss']
})
export class TurnoServicioExpresoComponent implements OnInit {

    servicio = Servicios.Expreso
    citaTipo = CitaTipoEnum
    citaEstado = CitaEstadoEnum
    citaOrigen = CitaOrigen
    searchText = ""
    public config: PerfectScrollbarConfigInterface = {};
    private stepper: Stepper;
    public pasoAcual: number = 1;
    public cita: CitaTurnoViewModel = null;
    public cliente: Cliente = null;
  
    //paso 1
    tieneCita: boolean
  
    //paso 2
    tipoCitaBusqueda: TipoDocumento = TipoDocumento.CITA
  
    //paso 3
    tipoClienteDocumento: TipoDocumento = TipoDocumento.CEDULA
  
    //paso 5
    listadoChasis: ComboBox[] = []
    chasisSeleccionado: ComboBox = null
  
    //paso 6
    mostrarturno: boolean;
    public turnoGenerado: TurnoViewModel = new TurnoViewModel();
  
    //teclado
    tipoTeclado: TecladoLayOuts = TecladoLayOuts.LayoutTecladoNumerico
    mostrarInput: boolean = true
  
  
    loading: boolean
    imprimiendo: boolean
  
  
    constructor(
      public toaster: ToastrService,
      private httpService: BackendService,
      private authService: AuthenticationService,
      private router: Router,
    ) { }
  
    ngOnInit() {
      this.stepper = new Stepper(document.querySelector('#stepper1'), {
        linear: true,
        animation: true
      })
    }
  
  
    //TECLADO DE BUSCAR CITA
    onSendNumeroCita(valor: string) {
  
      if (this.validarNumeroInsertado(valor, this.tipoCitaBusqueda))
        this.buscarCita(valor)
  
    }
  
    //TECLADO DE CLIENTE PARA HACER CITA
    onSendClienteDocumento(valor: string) {
  
      if (this.validarNumeroInsertado(valor, this.tipoClienteDocumento))
        this.getClientePorDocumento(valor)
  
    }
  
  
    getCitaDisponibleParaHoyPorID(citaID: number) {
      let parametros: ParametrosCita = {
        citaID: citaID,
        clienteDocumento: "",
        servicioID: this.servicio,
        sucursalID: Number(this.authService.tokenDecoded.groupsid)
      };
  
      this.loading = true;
      this.httpService.DoPostAny<CitaTurnoViewModel>(DataApi.Cita,
        "GetCitaDisponibleParaHoy", parametros).subscribe(response => {
  
          if (!response.ok) {
            this.toaster.error(response.errores[0]);
          } else {
            this.cita = response.records[0]
            this.stepperTo(6)
          }
  
          this.loading = false;
        }, error => {
          this.loading = false;
          this.toaster.error("Error conexion al servidor");
        });
    }
  
  
    getCitaDisponibleParaHoyPorClienteDocumento(clienteDocumento: string) {
      // { key: "sucursalID", value: this.authService.tokenDecoded.primarygroupsid }
  
      let parametros: ParametrosCita = {
        citaID: 0,
        clienteDocumento: clienteDocumento,
        servicioID: this.servicio,
        sucursalID: Number(this.authService.tokenDecoded.groupsid)
      };
  
      this.loading = true;
      this.httpService.DoPostAny<CitaTurnoViewModel>(DataApi.Cita,
        "GetCitaDisponibleHoyByClienteDocumento", parametros).subscribe(response => {
  
          if (!response.ok) {
            this.toaster.error(response.errores[0]);
          } else {
            this.cita = response.records[0]
            this.stepperTo(6)
          }
  
          this.loading = false;
        }, error => {
          this.loading = false;
          this.toaster.error("Error conexion al servidor");
        });
    }
  
  
  
  
  
  
  
  
  
    onTieneCitaRespuesta(poseeCita: boolean) {
      this.tieneCita = poseeCita
  
      if (this.tieneCita) {
        this.next();
  
      } else {
        this.stepperTo(3);
  
      }
    }
  
  
  
  
    buscarCita(tecladoValue: string) {
  
      if (this.tipoCitaBusqueda == TipoDocumento.CITA) {
        this.getCitaDisponibleParaHoyPorID(Number(tecladoValue));
  
      } else {
        this.getCitaDisponibleParaHoyPorClienteDocumento(tecladoValue);
      }
  
    }
  
  
    getClientePorDocumento(documento: string) {
      let parametros = new ParametrosCita();
      parametros.clienteDocumento = documento;
  
      this.loading = true;
      this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
        "GetClientePadronYRegistraCliente", parametros).subscribe(response => {
          this.loading = false;
  
          if (!response.ok) {
            this.toaster.error(response.errores[0]);
          } else {
            if (response.records.length > 0) {
              this.cliente = response.records[0];
              this.getChasisPorCliente(this.cliente.id)
              this.stepperTo(5);
            } else {
              this.toaster.error("Cliente no registrado");
              this.stepperTo(4);
            }
          }
  
        }, error => {
          this.loading = false;
          this.toaster.error("Error conexion al servidor");
        });
    }
  
    getChasisPorCliente(clienteID: number) {
  
      this.loading = true;
      this.httpService.DoPostAny<ComboBox>(DataApi.ComboBox,
        "GetChasisPorCliente", clienteID).subscribe(response => {
  
          if (!response.ok) {
            this.toaster.error(response.errores[0]);
          } else {
            this.listadoChasis = response.records
            if (this.listadoChasis != null && this.listadoChasis.length > 0) {
              this.chasisSeleccionado = this.listadoChasis[0]
            }
            console.table(this.listadoChasis)
          }
  
          this.loading = false;
        }, error => {
          this.loading = false;
          this.toaster.error("Error conexion al servidor");
        });
    }
  
  
    onSelectChasis() {
      this.cita = new CitaTurnoViewModel()
      this.cita.servicio = Servicios[this.servicio];
      this.cita.documento = this.cliente.documento;
      this.cita.chasis = this.chasisSeleccionado.nombre;
      this.cita.cliente = this.cliente.nombres + ' ' + this.cliente.apellidos;
      this.next();
  
    }
  
    onClickConfirmarTurno() {
  
      if (this.tieneCita) {
        this.generarTurnoQueTieneCita();
      } else {
        this.generarTurnoQueNoTieneCita();
      }
  
    }
    onBtnCancelarClick() {
      this.router.navigateByUrl('/turno/servicios');
  
    }
  
    generarTurnoQueTieneCita() {
  
      let turno = this.getNuevoTurno()
      turno.citaID = this.cita.citaID;
  
      let parametros = {
        "Turno": turno,
        "SucursalID": Number(this.authService.tokenDecoded.groupsid)
      };
  
      this.loading = true;
      this.httpService.DoPostAny<ComboBox>(DataApi.Turno,
        "generarTurnoQueTieneCita", parametros).subscribe(response => {
  
          if (!response.ok) {
            this.toaster.error(response.errores[0]);
          } else {
            this.mostrarturno = true;
            this.turnoGenerado = response.valores[0];
            console.log(response.valores[0])
            this.imprimirTurno();
            this.regresarALosServiciosTimer();
          }
  
          this.loading = false;
        }, error => {
          this.loading = false;
          this.toaster.error("Error conexion al servidor");
        });
  
  
    }
  
  
  
  
  
    generarTurnoQueNoTieneCita() {
  
      let turno = this.getNuevoTurno();
      let cita = this.getNuevaCita();
  
      let parametros = {
        "Turno": turno,
        "Cita": cita
      };
  
      this.loading = true;
      this.httpService.DoPostAny<ComboBox>(DataApi.Turno,
        "GenerarTurnoQueNoTieneCita", parametros).subscribe(response => {
  
          if (!response.ok) {
            this.toaster.error(response.errores[0]);
          } else {
            this.mostrarturno = true;
            this.turnoGenerado = response.valores[0];
            console.log(response.valores[0])
            this.imprimirTurno();
            this.regresarALosServiciosTimer();
          }
  
          this.loading = false;
        }, error => {
          this.loading = false;
          this.toaster.error("Error conexion al servidor");
        });
  
  
    }
  
  
  
    validarNumeroInsertado(tecladoValue: string, radioBoton: TipoDocumento): boolean {
  
      switch (radioBoton) {
  
        case TipoDocumento.CITA: {
  
          if (Number(tecladoValue) < 1) {
            this.toaster.warning("Cita inválida");
            return false;
          }
          return true;
        }
  
        case TipoDocumento.CEDULA: {
  
          if (!ValidatorLogic.ValidaCedulaFormacion(tecladoValue)) {
            this.toaster.warning("Cédula inválida");
            return false;
          }
          return true;
        }
  
        case TipoDocumento.RNC: {
  
          if (tecladoValue.length < 9) {
            this.toaster.warning("RNC inválido");
            return false;
          }
          return true;
        }
  
        case TipoDocumento.PASAPORTE: {
  
          if (tecladoValue.length < 9) {
            this.toaster.warning("Pasaporte inválido");
            return false;
          }
          return true;
        }
  
  
        default: {
          return false;
        }
      }
  
    }
  
  
  
  
    getNuevoTurno(): Turno {
  
      let turno: Turno = new Turno();
      turno.estadoID = 1; //PENDIENTE DE LLAMAR
      turno.servicioTipoID = this.servicio;
      turno.usuarioID = Number(this.authService.tokenDecoded.nameid);
      return turno;
  
    }
    getNuevaCita(): Cita {
      let cita: Cita = new Cita();
      cita.clienteID = this.cliente.id;
      cita.vehiculoID = this.chasisSeleccionado.codigo
      cita.sucursalID = Number(this.authService.tokenDecoded.groupsid);
      cita.usuarioCreadorID = Number(this.authService.tokenDecoded.nameid);
      cita.servicioTipoID = this.servicio;
      cita.estadoID = this.citaEstado.CITA;
      cita.citaTipoID = this.citaTipo.AUTOGENERADA;
      cita.origenCitaID = this.citaOrigen.ERP;
      cita.categoriaID = 2;
      return cita;
    }
  
    imprimirTurno() {
      this.imprimiendo = true;
      setTimeout(function () {
        window.print();
      }, 1000);
    }
  
    regresarALosServiciosTimer() {
      let thes = this;
      setTimeout(
        function () {
          thes.router.navigateByUrl('/turno/servicios');
        }, 4000);
    }
  
  
  
  
    //STEPPER
  
    next() {
      this.stepper.next();
      this.pasoAcual++;
    }
  
    previous() {
      this.stepper.previous();
      this.pasoAcual--;
    }
  
    stepperTo(step: number) {
      this.stepper.to(step);
      this.pasoAcual = step;
    }
  
  }