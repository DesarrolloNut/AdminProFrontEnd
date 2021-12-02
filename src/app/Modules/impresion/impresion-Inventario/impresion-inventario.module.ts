import { ImpresionInventarioRoutingModule } from './impresion-inventario-routing.module';
import { ImpresionInventarioComponent } from './impresion-inventario.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { NgxBarcodeModule } from 'ngx-barcode';
import { PrintDPreventaDetallesComponent } from './despacho/despacho-preventa-detalles/print-d-preventa-detalles.component';


@NgModule({
  declarations: [ImpresionInventarioComponent, PrintDPreventaDetallesComponent],
  imports: [
    CommonModule,
    NgxBarcodeModule,
    ImpresionInventarioRoutingModule,
    SharedModule
  ]
})
export class ImpresionInventarioModule { }
