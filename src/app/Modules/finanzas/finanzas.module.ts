import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinanzasRoutingModule } from './finanzas-routing.module';
import { FinanzasComponent } from './finanzas.component';
import { ChequesDevueltosListadoComponent } from './cuentas-por-cobrar/cheques-devueltos/cheques-devueltos-listado/cheques-devueltos-listado.component';
import { ChequesDevueltosFormularioComponent } from './cuentas-por-cobrar/cheques-devueltos/cheques-devueltos-formulario/cheques-devueltos-formulario.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [FinanzasComponent, ChequesDevueltosListadoComponent, ChequesDevueltosFormularioComponent],
  imports: [
    CommonModule,
    FinanzasRoutingModule,
    SharedModule
  ]
})
export class FinanzasModule { }
