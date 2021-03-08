import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultaClienteRecepcionComponent } from './consulta-cliente-recepcion/consulta-cliente-recepcion.component';
import { ConsultaClienteOrdenServicioComponent } from './consulta-cliente-orden-servicio/consulta-cliente-orden-servicio.component';
import { ConsultaClienteOfertaResultadosComponent } from './consulta-cliente-oferta-resultados/consulta-cliente-oferta-resultados.component';

const routes: Routes = [
  { path: 'recepcion/:id', component: ConsultaClienteRecepcionComponent },
  { path: 'orden-servicio/:id', component: ConsultaClienteOrdenServicioComponent },
  { path: 'oferta-resultados/:id', component: ConsultaClienteOfertaResultadosComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsultaClienteRoutingModule { }
