import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImpresionProduccionRoutingModule } from './impresion-produccion-routing.module';
import { ImpresionProduccionComponent } from './impresion-produccion.component';
import { PesajeResultadoCodigoBarraComponent } from './pesaje/pesaje-resultado-codigo-barra/pesaje-resultado-codigo-barra.component';
import { SharedModule } from '../../shared/shared.module';
import { NgxBarcodeModule } from 'ngx-barcode';


@NgModule({
  declarations: [ImpresionProduccionComponent, PesajeResultadoCodigoBarraComponent],
  imports: [
    CommonModule,
    NgxBarcodeModule,
    ImpresionProduccionRoutingModule,
    SharedModule
  ]
})
export class ImpresionProduccionModule { }
