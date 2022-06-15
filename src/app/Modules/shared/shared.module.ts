import { ConnectionBalanzaComponent } from './../../shared/connection-balanza/connection-balanza.component';
import { LoadingRealTimeComponent } from './../../shared/loading-realtime/loading-realtime.component';
import { NgSelectModule } from '@ng-select/ng-select';
//import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule } from '@syncfusion/ej2-angular-calendars';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { LoadingListadoComponent } from 'src/app/shared/loading-listado/loading-listado.component';
import { ErrorConnectionInternetComponent } from 'src/app/shared/error-connection-internet/error-connection-internet.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { FilterPipe } from 'src/app/shared/pipes/filter.pipe';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ErrorPermissionDeniedComponent } from 'src/app/shared/error-permission-denied/error-permission-denied.component';
import { FilterFuncPipe } from 'src/app/shared/pipes/filterFunc.pipe';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
    declarations: [LoadingListadoComponent, LoadingRealTimeComponent, ErrorConnectionInternetComponent, ErrorPermissionDeniedComponent ,ConnectionBalanzaComponent, FilterPipe, FilterFuncPipe],
    imports: [
        NgxPermissionsModule.forChild(),
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        NgbPaginationModule,
        NgxMaskModule.forRoot(),
        PerfectScrollbarModule,

    ], exports: [
        NgxPermissionsModule,
        NgxMaskModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarModule,
        DatePickerModule,
        NgbPaginationModule,
        LoadingListadoComponent,
        LoadingRealTimeComponent,
        ErrorConnectionInternetComponent,
        ErrorPermissionDeniedComponent,
        ConnectionBalanzaComponent,
        FilterPipe,
        FilterFuncPipe,
        PerfectScrollbarModule
    ]


})
export class SharedModule { }
