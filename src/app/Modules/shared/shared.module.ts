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

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
    declarations: [LoadingListadoComponent, ErrorConnectionInternetComponent, FilterPipe],
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
        ErrorConnectionInternetComponent,
        FilterPipe,
        PerfectScrollbarModule
    ]


})
export class SharedModule { }
