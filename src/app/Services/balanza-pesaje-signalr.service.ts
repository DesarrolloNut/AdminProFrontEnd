import { EventEmitter, Inject, Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../core/authentication/service/authentication.service';
import { BalanzaPesoGrupoSignalREnum } from '../shared/enums/BalanzaPesoGrupoSignalREnum';
import { Subscription } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class BalanzaPesajeSignalrService {






  private hubConnection: signalR.HubConnection
  pesoBalanza = new EventEmitter<string>();
  refreshListado = new EventEmitter<boolean>();
  private baseUrl: string;

  almacenID: number = 0;


  balanzaInitied=false;
  private grupoBalanzaPesaje = "GRUPO_PANTALLA_PESAJE_USUARIO_" + this.auth.tokenDecoded.nameid
  private grupoBalanzaListado = "GRUPO_PANTALLA_PESAJE_ALMACEN_"

  private ip="";
  private port=0;

  handlerPeso = (pesoBalanza: any) => {
 //console.log(pesoBalanza)
    if (pesoBalanza.ok) {
      this.pesoBalanza.emit(pesoBalanza.data)
    }else{
      this.toaster.warning(pesoBalanza.message)
      this.pesoBalanza.emit(pesoBalanza.message)
      setTimeout(() => {
    //    location.reload();
      }, 3000);
    }

   // console.log(this.pesoBalanza)
   // this.pesoBalanza.emit(pesoBalanza);
 }


  constructor(
    @Inject('BASE_URL') _baseUrl: string,
    private auth: AuthenticationService,
    private toaster: ToastrService,
    // private f: SpeechSynthesisUtteranceFactoryService,
  ) {
    this.baseUrl = _baseUrl;
  }

  // https://appadmin.nutriciosa.com:5000/
  public  startConnection =  async (grupo: BalanzaPesoGrupoSignalREnum) => {

        let url_1="https://appadmin.nutriciosa.com/nutriciosabalanza/balanzaPesaje"
        let url_2="http://localhost:50552/balanzaPesaje"
        let url_3="http://localhost:50551/balanzaPesaje"

      if(this.hubConnection?.state==signalR.HubConnectionState.Connected){
        this.hubConnection.off('SendPesoToScreen'.toLowerCase(),this.handlerPeso);
        await  this.hubConnection.stop();
      }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(url_1)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
     this.hubConnection
      .start().
      then(ok => {
        this.subscribirMetodos();
        this.toaster.info("Actualización en tiempo real.", "Sistema pesaje.")
        this.balanzaInitied=true;
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
        this.balanzaInitied=false;

        console.log('Error while starting connection: ' + err);

        // setTimeout(() => {
        //   this.startConnection(grupo);
        // }, 3000)

      });
  }


  public desconectarConexion() {
   //  this.hubConnection.

  }



  public subscribirMetodos = () => {


   this.hubConnection.on('SendPesoToScreen',this.handlerPeso);

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

  public getPesajeFromBalanza(port: number, ipBalanza: string)   {
    this.hubConnection.invoke("SendPesoToScreen", this.grupoBalanzaPesaje, port, ipBalanza).catch(err => {
     // this.toaster.warning("Error conexion con balanza");
      return console.error(err);
    });

  }


  public  async disconnectBalanza(port: number, ipBalanza: string)  {
   if(!this.balanzaInitied){return;}
    this.hubConnection.invoke("DisconnectBalanza",  this.grupoBalanzaPesaje, port, ipBalanza).then(
       x =>{
        this.toaster.success("Balanza desconectada", "Balanza")
         this.balanzaInitied=false;
         if(this.hubConnection?.state==signalR.HubConnectionState.Connected){
          this.hubConnection.off('SendPesoToScreen'.toLowerCase(),this.handlerPeso)
          this.hubConnection.stop();
        }

      }
    ).catch(err => {
      this.toaster.error("Error, no se pudo desconectar.", "Balanza")
      return console.error(err);
    });

  }
  public JoinGroup(group: string) {


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
