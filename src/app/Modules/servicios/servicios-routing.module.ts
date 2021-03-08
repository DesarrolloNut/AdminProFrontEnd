import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CitaListadoComponent } from './citas/cita-listado/cita-listado.component';
import { CitaFormularioComponent } from './citas/cita-formulario/cita-formulario.component';
import { RecepcionLlamadoComponent } from './recepcion/recepcion-llamado/recepcion-llamado.component';
import { RecepcionEditComponent } from './recepcion/recepcion-edit/recepcion-edit.component';
import { OrdenesListadoComponent } from './ordenes/ordenes-listado/ordenes-listado.component';
import { TallerMultipuntosComponent } from './recepcion/multipuntos/taller-multipuntos/taller-multipuntos.component';
import { MultipuntoOrdenesServicioListadoComponent } from './recepcion/multipuntos/multipunto-ordenes-servicio-listado/multipunto-ordenes-servicio-listado.component';
import { OrdenesListadoTodasComponent } from './ordenes/ordenes-listado-todas/ordenes-listado-todas.component';


const routes: Routes = [
    { path: '', redirectTo: 'citas', pathMatch: "full" },
    {
        path: 'citas',
        data: {
            title: 'ViaCloud | Citas',
            urls: [
                { title: 'Servicios', },
                { title: 'Citas' }
            ]
        },
        component: CitaListadoComponent,
    },
    {
        path: 'citas/:id',
        data: {
            title: 'ViaCloud | Formulario de citas',
            urls: [
                { title: 'Servicios', },
                { title: 'Citas', url: "/servicios/citas" },
                { title: 'Formulario de citas' }
            ]
        },
        component: CitaFormularioComponent,
    },
    {
        path: 'recepcion-llamado',
        data: {
            title: 'ViaCloud | Llamado a recepción',
            urls: [
                { title: 'Servicios', },
                { title: 'Llamado a recepción' }
            ]
        },
        component: RecepcionLlamadoComponent,
    },
    {
        path: 'recepcion-llamado/:id',
        data: {
            title: 'ViaCloud | Formulario de recepción',
            urls: [
                { title: 'Servicios', },
                { title: 'Recepción llamado', url: "/servicios/recepcion-llamado" },
                { title: 'Formulario de recepción' }
            ]
        },
        component: RecepcionEditComponent,
    },
    {
        path: 'ordenes',
        data: {
            title: 'ViaCloud | Ordenes de servicio',
            urls: [
                { title: 'Servicios', },
                { title: 'Ordenes de servicio' }
            ]
        },
        component: OrdenesListadoComponent,
    },
    {
        path: 'ordeness',
        data: {
            title: 'ViaCloud | Ordenes de servicio',
            urls: [
                { title: 'Servicios', },
                { title: 'Ordenes de servicio' }
            ]
        },
        component: OrdenesListadoTodasComponent,
    },

    {
        path: 'multipuntos', component: MultipuntoOrdenesServicioListadoComponent, data: {
            title: 'Viacloud | Multipuntos Taller',
            urls: [
                { title: 'Multipuntos Taller' }
            ]
        }
    },
    {
        path: 'multipuntos/:id', component: TallerMultipuntosComponent, data: {
            title: 'Viacloud | Multipuntos Taller',
            urls: [
                { title: 'Multipuntos Taller' }
            ]
        }
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ServiciosRoutingModule { }
