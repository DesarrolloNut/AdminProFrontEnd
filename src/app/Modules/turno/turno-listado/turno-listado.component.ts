import { Component, OnInit, OnDestroy } from '@angular/core';
import { TurnoViewModel } from '../models/TurnoViewModel';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { TurnoSignalRService } from 'src/app/Services/turno-signal-r.service';
import { SignalRTurnosGrupos } from 'src/app/shared/enums/SignalRTurnosGrupos';

@Component({
  selector: 'app-turno-listado',
  templateUrl: './turno-listado.component.html',
  styleUrls: ['./turno-listado.component.scss']
})
export class TurnoListadoComponent implements OnInit, OnDestroy {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  turnos: TurnoViewModel[] = [] //tu modelo
  turnosALlamar: TurnoViewModel[] = [] //tu modelo

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private signalRTurnos: TurnoSignalRService,
  ) { }

  ngOnInit() {
    this.signalRTurnos.startConnection(SignalRTurnosGrupos.Pantalla_Turnos);
    this.signalRTurnos.turnosRecibidos.subscribe((t: TurnoViewModel[]) => this.turnos = t)
    this.getTurnos();
    setInterval(function () {
      location.reload();
    }, 1000 * 1 * 60 * 60);
  }


  getTurnos() {

    this.Cargando = true;

    let parametros = [
      { key: "sucursalID", value: this.authService.tokenDecoded.groupsid },
    ];
    console.log(parametros)
    this.httpService.DoPost<TurnoViewModel>(DataApi.Turno, "GetTurnos", parametros).subscribe(x => {

      if (!x.ok) {
        this.toastService.error(x.errores[0]);
      } else {
        if (x.records != null && x.records.length > 0) {
          // this.signalR.data = x.records;
          this.turnos = x.records
        }

        console.log(x.records)

      }
      this.Cargando = false;
    }, error => {
      this.toastService.error("Error conexion al servidor");
      this.Cargando = false;
    });
  }

  ngOnDestroy(): void {
    this.signalRTurnos.ExitGroup(SignalRTurnosGrupos.Pantalla_Turnos);
    this.toastService.warning("Desconectado.", "Turnos realtime.")
    console.log("Destruido")
  }


}
