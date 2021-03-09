// import { NgModule } from 'src/app/modules/starter/node_modules/@angular/core';
// import { CommonModule } from 'src/app/modules/starter/node_modules/@angular/common';
// import { FormsModule } from 'src/app/modules/starter/node_modules/@angular/forms';
// import { Routes, RouterModule } from 'src/app/modules/starter/node_modules/@angular/router';

import { HomeComponent } from './home.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
const routes: Routes = [
    {
        path: '',
        data: {
            title: 'Nutriciosa | Inicio',
            urls: [
                { title: 'Inicio' }
            ],
        },
        component: HomeComponent,
    }
];

@NgModule({
    imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule.forChild(routes), ChartsModule, PerfectScrollbarModule,
        ],
    declarations: [HomeComponent]
})
export class HomeModule { }
