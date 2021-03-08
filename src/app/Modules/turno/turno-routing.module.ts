import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TurnoServiciosComponent } from './turno-servicios/turno-servicios.component';
import { TurnoComponent } from './turno.component';
import { TurnoListadoComponent } from './turno-listado/turno-listado.component';
import { TurnoServicioTallerComponent } from './turno-servicios/turno-servicio-taller/turno-servicio-taller.component';
import { TurnoServicioExpresoComponent } from './turno-servicios/turno-servicio-expreso/turno-servicio-expreso.component';
import { TurnoEntregasComponent } from './turno-entregas/turno-entregas.component';

const routes: Routes = [
    {
        path: '', component: TurnoComponent, children: [

            { path: '', redirectTo: 'servicios' },
            { path: 'servicios', component: TurnoServiciosComponent, },
            { path: 'servicios/taller', component: TurnoServicioTallerComponent },
            { path: 'servicios/expreso', component: TurnoServicioExpresoComponent },
            { path: 'entregas', component: TurnoEntregasComponent },
            // { path: 'recepcion', component: TurnoRecepcionLlamadoComponent },
            // { path: 'recepcion/:id', component: TurnoRecepcionEditComponent },
            { path: 'listado', component: TurnoListadoComponent },
            { path: '**', redirectTo: 'servicios' },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TurnoRoutingModule { }
