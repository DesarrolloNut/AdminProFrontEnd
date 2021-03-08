import { NgModule } from '@angular/core';
import { TurnoRoutingModule } from './turno-routing.module';
import { TurnoComponent } from './turno.component';
import { TurnoListadoComponent } from './turno-listado/turno-listado.component';
import { TurnoHomeComponent } from './turno-home/turno-home.component';
import { TurnoServiciosComponent } from './turno-servicios/turno-servicios.component';
import { TurnoServicioTallerComponent } from './turno-servicios/turno-servicio-taller/turno-servicio-taller.component';
import { TurnoServicioExpresoComponent } from './turno-servicios/turno-servicio-expreso/turno-servicio-expreso.component';
import { TurnoEntregasComponent } from './turno-entregas/turno-entregas.component';
import { TurnoRecepcionLlamadoComponent } from './turno-recepcion/turno-recepcion-llamado/turno-recepcion-llamado.component';
import { TurnoRecepcionEditComponent } from './turno-recepcion/turno-recepcion-edit/turno-recepcion-edit.component';
import { TecladoVirtualComponent } from 'src/app/shared/teclado-virtual/teclado-virtual.component';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    TurnoComponent,
    TurnoListadoComponent,
    TurnoHomeComponent,
    TurnoServiciosComponent, 
    TurnoServicioTallerComponent,
    TurnoServicioExpresoComponent,
    TurnoEntregasComponent,
    TurnoRecepcionLlamadoComponent,
    TurnoRecepcionEditComponent,
    TecladoVirtualComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TurnoRoutingModule
  ],
  providers: [
    // { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
    // { provide: 'BASE_URL', useFactory: getBaseUrl }, AuthGuard,
],
})
export class TurnoModule { }

// export function getBaseUrl() {
//   return environment.apiUrl;
// }