import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConsultaClienteRoutingModule } from './consulta-cliente-routing.module';
import { ConsultaClienteRecepcionComponent } from './consulta-cliente-recepcion/consulta-cliente-recepcion.component';
import { SharedModule } from '../shared/shared.module';
import { ConsultaClienteOrdenServicioComponent } from './consulta-cliente-orden-servicio/consulta-cliente-orden-servicio.component';
import { NgxBarcodeModule } from 'ngx-barcode';
import { ConsultaClienteOfertaResultadosComponent } from './consulta-cliente-oferta-resultados/consulta-cliente-oferta-resultados.component';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [ConsultaClienteRecepcionComponent, ConsultaClienteOrdenServicioComponent, ConsultaClienteOfertaResultadosComponent],
  imports: [
    CommonModule,
    NgxBarcodeModule,
    QRCodeModule,
    SharedModule,
    ConsultaClienteRoutingModule
  ]
})
export class ConsultaClienteModule { }
