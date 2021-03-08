import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { CalendarModule } from '@syncfusion/ej2-angular-calendars';
import { VentasReportesRoutingModule } from './ventas-reportes-routing.module';
import { VentasReportesComponent } from './ventas-reportes.component';
import { ReporteOfertasOtorgadasComponent } from './reporte-ofertas-otorgadas/reporte-ofertas-otorgadas.component';


@NgModule({
  declarations: [VentasReportesComponent, ReporteOfertasOtorgadasComponent],
  imports: [
    CommonModule,
    VentasReportesRoutingModule,
    DatePickerModule, 
    CalendarModule,
  ]
})
export class VentasReportesModule { }
