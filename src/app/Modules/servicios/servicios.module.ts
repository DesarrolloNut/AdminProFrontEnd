import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiciosRoutingModule } from './servicios-routing.module';
import { ServiciosComponent } from './servicios.component';
import { CitaListadoComponent } from './citas/cita-listado/cita-listado.component';
import { CitaFormularioComponent } from './citas/cita-formulario/cita-formulario.component';
import { SharedModule } from '../shared/shared.module';
import { RecepcionLlamadoComponent } from './recepcion/recepcion-llamado/recepcion-llamado.component';
import { RecepcionEditComponent } from './recepcion/recepcion-edit/recepcion-edit.component';
import { RecepcionListComponent } from './recepcion/recepcion-list/recepcion-list.component';
import { WebcamModule } from 'ngx-webcam';
import { RecepcionCamaraComponent } from './recepcion/recepcion-camara/recepcion-camara.component';
import { SignaturePadModule } from '@ng-plus/signature-pad';
import { OrdenesListadoComponent } from './ordenes/ordenes-listado/ordenes-listado.component';
import { MultipuntoOrdenesServicioListadoComponent } from './recepcion/multipuntos/multipunto-ordenes-servicio-listado/multipunto-ordenes-servicio-listado.component';
import { TallerMultipuntosComponent } from './recepcion/multipuntos/taller-multipuntos/taller-multipuntos.component';
import { OrdenesListadoTodasComponent } from './ordenes/ordenes-listado-todas/ordenes-listado-todas.component';
@NgModule({
    declarations: [ServiciosComponent, CitaListadoComponent,
        CitaFormularioComponent, RecepcionLlamadoComponent,
        RecepcionEditComponent, RecepcionListComponent, RecepcionCamaraComponent, OrdenesListadoComponent, TallerMultipuntosComponent, MultipuntoOrdenesServicioListadoComponent, OrdenesListadoTodasComponent],
    imports: [
        CommonModule,
        SharedModule,
        WebcamModule,
        SignaturePadModule,
        ServiciosRoutingModule
    ]
})
export class ServiciosModule { }
