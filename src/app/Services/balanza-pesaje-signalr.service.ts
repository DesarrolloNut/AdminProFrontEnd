import { EventEmitter, Inject, Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../core/authentication/service/authentication.service';
import { BalanzaPesoGrupoSignalREnum } from '../shared/enums/BalanzaPesoGrupoSignalREnum';

@Injectable({
  providedIn: 'root'
})
export class BalanzaPesajeSignalrService {

  private hubConnection: signalR.HubConnection
  pesoBalanza = new EventEmitter<string>();
  refreshListado = new EventEmitter<boolean>();
  private baseUrl: string;

  almacenID: number = 0;

  private grupoBalanzaPesaje = "GRUPO_PANTALLA_PESAJE_USUARIO_" + this.auth.tokenDecoded.nameid
  private grupoBalanzaListado = "GRUPO_PANTALLA_PESAJE_ALMACEN_"
  // private grupoTurnoReceptores = "Receptores_Turnos_Sucursal_" + this.auth.tokenDecoded.groupsid

  constructor(
    @Inject('BASE_URL') _baseUrl: string,
    private auth: AuthenticationService,
    private toaster: ToastrService,
    // private f: SpeechSynthesisUtteranceFactoryService,
    // private svc: SpeechSynthesisService,
  ) {
    this.baseUrl = _baseUrl;
  }


  public startConnection = (grupo: BalanzaPesoGrupoSignalREnum) => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.baseUrl + "balanzaPesaje")
      .build();
    this.hubConnection
      .start().
      then(ok => {
        this.subscribirMetodos();
        this.toaster.info("Conexión establecida.", "Balanza Pesaje.")
        // this.JoinGroup(this.grupoBalanzaPesaje)
        switch (grupo) {
          case BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje:
            this.JoinGroup(this.grupoBalanzaPesaje)
            break;

          case BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje_Listado:
            this.JoinGroup(this.grupoBalanzaListado + this.almacenID)
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


  public desconectarConexion() {
    // this.hubConnection.


  }



  public subscribirMetodos = () => {

    this.hubConnection.on('SendPesoToScreen', (pesoBalanza: string) => {
      this.pesoBalanza.emit(pesoBalanza);
    });

    this.hubConnection.on('RefreshListScreen', (refresh: boolean) => {
      this.refreshListado.emit(refresh);
    });

    //subscribir a otro metodo

  }



  //para refrescar el listado de pesajes 
  //cuando en el formulario se registra un nuevo peso
  //para ese almacen
  public refrescarListadoPesajes(almacenID: number) {

    this.hubConnection.invoke("RefreshListScreen", this.grupoBalanzaListado + almacenID).catch(err => {
      return console.error(err);
    });

  }

  public getPesajeFromBalanza(port: number, ipBalanza: string) {
    console.log()
    this.hubConnection.invoke("SendPesoToScreen", this.grupoBalanzaPesaje, port, ipBalanza).catch(err => {
      return console.error(err);
    });

  }


  public JoinGroup(group: string) {

    console.log(group)

    this.hubConnection.invoke("JoinGroup", group).then(
      x => console.log("Conectado al grupo")
    ).catch(err => {
      this.toaster.error("Error, no se pudo unir.", "Grupo")
      return console.error('JoinGroup Error: ' + err);
    });
  }

  public ExitGroup(grupoTipo: BalanzaPesoGrupoSignalREnum) {
    let grupoNombre: string = "";

    switch (grupoTipo) {
      case BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje:
        grupoNombre = this.grupoBalanzaPesaje
        break;

      case BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje_Listado:
        grupoNombre = this.grupoBalanzaListado
        break;

      default:
        break;
    }
    this.hubConnection.invoke("ExitGroup", grupoNombre).catch(err => {
      return console.error('ExitGroup error: ' + err);
    });
  }


}
