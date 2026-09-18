import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { BalanzaPesajeSignalrService } from 'src/app/Services/balanza-pesaje-signalr.service';
import { BalanzaPesoGrupoSignalREnum } from '../enums/BalanzaPesoGrupoSignalREnum';
import { DataApi } from '../enums/DataApi.enum';

@Component({
  selector: 'app-connection-balanza',
  templateUrl: './connection-balanza.component.html',
  styleUrls: ['./connection-balanza.component.scss']
})
export class ConnectionBalanzaComponent implements OnInit {
  loadingPeso: boolean;
  balanzaConnected: boolean;
  @Input() public usuario: Usuario;

  constructor(private modalService: NgbModal,
      private signalRService: BalanzaPesajeSignalrService,
      private authService: AuthenticationService,
      private httpService: BackendService,
      private toastService: ToastrService,

    ) { }

ngOnInit(): void {
    this.getUsuarioLogueado();
}
//CIERRE DE MODAL
closeModal(){
  this.modalService.dismissAll();
}
connectBalanza(){

  this.startPingingBalanza()
}

disconnectBalanza(){
    setTimeout( () => {

        this.signalRService.disconnectBalanza(Number(this.usuario.puertoEquipo),
         this.usuario.ipEquipo)
         this.balanzaConnected=false;
        }, 1000);


}

startPingingBalanza() {
  this.signalRService.startConnection(BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje);
  setTimeout(() => {

        if (!this.loadingPeso)  {
           // this.loadingPeso = true;
              this.signalRService.getPesajeFromBalanza(Number(this.usuario.puertoEquipo),
              this.usuario.ipEquipo)
               this.balanzaConnected=true;
        }
      }, 1000);
  }


getUsuarioLogueado() {
  let usuarioID: number = Number(this.authService.tokenDecoded.nameid)

  this.httpService.DoPostAny<Usuario>(DataApi.Usuario,
    "GetUsuarioByID", usuarioID).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        //validar que existe
        if (response != null && response.records != null && response.records.length > 0) {

          let usuario = response.records[0];
          this.usuario = usuario;

        } else {
          this.toastService.warning("Usuario no encontrado");
        }
      }

    }, error => {
      this.toastService.error("Error conexion al servidor");
    });
}
}
