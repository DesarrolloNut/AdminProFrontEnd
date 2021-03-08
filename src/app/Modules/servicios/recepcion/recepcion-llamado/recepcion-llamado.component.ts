import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { FormBuilder } from '@angular/forms';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Posicion } from '../models/Posicion';
import { TurnoRecepcionViewModel } from '../models/TurnoRecepcionViewModel';
import { TurnoSignalRService } from 'src/app/Services/turno-signal-r.service';
import { SignalRTurnosGrupos } from 'src/app/shared/enums/SignalRTurnosGrupos';

@Component({
  selector: 'app-recepcion-llamado',
  templateUrl: './recepcion-llamado.component.html',
  styleUrls: ['./recepcion-llamado.component.scss']
})
export class RecepcionLlamadoComponent implements OnInit, OnDestroy {

  Cargando: boolean = false;
  posicion: Posicion = null;
  turnoActual: TurnoRecepcionViewModel;
  CargandoBoton: boolean;
  LlamandoTurno: boolean;



  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private router: Router,
    private authService: AuthenticationService,
    private signalRTurnos: TurnoSignalRService, ) { }




  ngOnInit() {
    this.getPosicionReceptor();
    this.signalRTurnos.startConnection(SignalRTurnosGrupos.Receptor);
  }


  getPosicionReceptor() {

    this.Cargando = true;

    let parametros = [
      { key: "sucursalID", value: this.authService.tokenDecoded.groupsid },
      { key: "receptorID", value: Number(this.authService.tokenDecoded.nameid) },
    ];

    this.httpService.DoPost<Posicion>(DataApi.PosicionRecepcion, "GetPosicionByUsarioID", parametros).subscribe(x => {

      if (x.ok) {
        if (x.records != null && x.records.length > 0) {
          this.posicion = x.records[0];
          this.getTurnoActual();
        }
      } else {
        this.toastService.error(x.errores[0]);
        this.router.navigateByUrl("/home");
      }

    }, error => {
      this.toastService.error("Error conexion al servidor");
      this.Cargando = false;
    });

  }



  getTurnoActual() {

    this.Cargando = true;

    let parametros = [
      { key: "sucursalID", value: this.authService.tokenDecoded.groupsid },
      { key: "posicionReceptor", value: this.posicion.id },
    ];

    this.httpService.DoPost<TurnoRecepcionViewModel>(DataApi.Turno, "GetTurnoActualInformacionPorPosicion", parametros).subscribe(x => {
      if (!x.ok) {
        this.toastService.error(x.errores[0]);
      } else {
        if (x.records != null && x.records.length > 0) {
          this.turnoActual = x.records[0];
          this.EnviarVozTurno();
        }
      }

      this.Cargando = false;

    }, error => {
      this.toastService.error("Error conexion al servidor");
      this.Cargando = false;

    });

  }



  LlamarTurno() {


    this.Cargando = true;
    let parametros = [
      { key: "sucursalID", value: this.authService.tokenDecoded.groupsid },
      { key: "receptorID", value: Number(this.authService.tokenDecoded.nameid) },
    ];

    this.httpService.DoPost<any>(DataApi.Turno, "LlamarTurnoSiguiente", parametros).subscribe(x => {
      this.signalRTurnos.EnviarTurnosAPantallas();

      if (!x.ok) {
        this.toastService.error(x.errores[0]);
        this.turnoActual = null;
      } else {
        this.getTurnoActual();
        let thes = this;
        this.CargandoBoton = true;
        setTimeout(function () { thes.CargandoBoton = false; }, 5000);
      }

      // this.signalR.SendTurnosToPantallas(this.auth.currentUserObject.sucursalID);

      this.Cargando = false;
    }, error => {
      this.toastService.error("Error conexion al servidor");
      this.Cargando = false;
    });

  }


  EnviarVozTurno() {

    let mensajeTurno: string = `Turno ${this.turnoActual.turno}. ${this.turnoActual.cliente}. Por favor ir a la posición ${this.turnoActual.posicion}`;
    this.signalRTurnos.LlamarTurnoVoice(mensajeTurno);

  }

  ngOnDestroy(): void {
    this.signalRTurnos.ExitGroup(SignalRTurnosGrupos.Receptor);
    this.toastService.warning("Desconectado.", "Turnos realtime.")
    console.log("Destruido")
  }


}
