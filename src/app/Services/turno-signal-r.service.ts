import { Injectable, Inject, EventEmitter } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import {
  SpeechSynthesisUtteranceFactoryService,
  SpeechSynthesisService
} from '@kamiazya/ngx-speech-synthesis';
import { AuthenticationService } from '../core/authentication/service/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { SignalRTurnosGrupos } from '../shared/enums/SignalRTurnosGrupos';
import { TurnoViewModel } from '../Modules/turno/models/TurnoViewModel';

@Injectable({
  providedIn: 'root'
})
export class TurnoSignalRService {

  private hubConnection: signalR.HubConnection
  turnosRecibidos = new EventEmitter<TurnoViewModel[]>();
  private baseUrl: string;

  private grupoTurnoPantallas = "Pantalla_Turnos_Sucursal_" + this.auth.tokenDecoded.groupsid
  private grupoTurnoReceptores = "Receptores_Turnos_Sucursal_" + this.auth.tokenDecoded.groupsid

  constructor(
    @Inject('BASE_URL') _baseUrl: string,
    private auth: AuthenticationService,
    private toaster: ToastrService,
    private f: SpeechSynthesisUtteranceFactoryService,
    private svc: SpeechSynthesisService,
  ) {
    this.baseUrl = _baseUrl;
  }


  public startConnection = (grupo: SignalRTurnosGrupos) => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.baseUrl + "turnos")
      .build();
    this.hubConnection
      .start().
      then(ok => {
        this.subscribirMetodosDeTurno();
        this.toaster.info("Conexión establecida.", "Turnos realtime.")

        switch (grupo) {
          case SignalRTurnosGrupos.Pantalla_Turnos:
            this.JoinGroup(this.grupoTurnoPantallas)
            break;

          case SignalRTurnosGrupos.Receptor:
            // this.JoinGroup(this.grupoTurnoPantallas)
            break;
          default:
            break;
        }

      })
      .catch(err => {

        console.log('Error while starting connection: ' + err);

        // this.toaster.error("Error conexión.", "Turnos realtime.")
        // this.toaster.info("Se intentará nuevamente.", "Turnos realtime.")

        setTimeout(() => {
          this.startConnection(grupo);
        }, 3000)

      });
  }


  public desconecarConexion() {
    // this.hubConnection.


  }



  public subscribirMetodosDeTurno = () => {

    this.hubConnection.on('EnviarTurnosAPantallas', (turnos: TurnoViewModel[]) => {
      // this.data = data;
      this.toaster.success("Llamada realizada.");
      this.turnosRecibidos.emit(turnos);
    });

    this.hubConnection.on("LlamarTurnoVoice", (mensajeTurno) => {
      this.speech(mensajeTurno);
      this.toaster.success("Voz hablando")
    });
  }



  public EnviarTurnosAPantallas() {
    // let grupo: string = `PantallaTurnoSucursal${this.auth.currentUserObject.sucursalID}`;

    this.hubConnection.invoke("EnviarTurnosAPantallas", this.grupoTurnoPantallas, Number(this.auth.tokenDecoded.groupsid)).catch(err => {
      return console.error(err);
    });
  }

  public JoinGroup(group: string) {
    this.hubConnection.invoke("JoinGroup", group).catch(err => {
      this.toaster.error("Error, no se pudo unir.", "Grupo")
      return console.error('JoinGroup Error: ' + err);
    });
  }

  public ExitGroup(grupoTipo: SignalRTurnosGrupos) {
    let grupoNombre: string = "";

    switch (grupoTipo) {
      case SignalRTurnosGrupos.Pantalla_Turnos:
        grupoNombre = this.grupoTurnoPantallas
        break;

      case SignalRTurnosGrupos.Receptor:
        grupoNombre = this.grupoTurnoReceptores
        break;
      default:
        break;
    }
    this.hubConnection.invoke("ExitGroup", grupoNombre).catch(err => {
      return console.error('ExitGroup error: ' + err);
    });
  }


  public LlamarTurnoVoice(mensaje: string) {

    this.hubConnection.invoke("LlamarTurnoVoice", this.grupoTurnoPantallas, mensaje).catch(err => {
      return console.error('LlamarTurnoVoice Error: ' + err);
    });

  }


  speech(mensaje: string) {
    const v = this.f.text(mensaje);
    this.svc.speak(this.f.text(mensaje));
  }



}
