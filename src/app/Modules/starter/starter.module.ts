// import { NgModule } from 'src/app/modules/starter/node_modules/@angular/core';
// import { CommonModule } from 'src/app/modules/starter/node_modules/@angular/common';
// import { FormsModule } from 'src/app/modules/starter/node_modules/@angular/forms';
// import { Routes, RouterModule } from 'src/app/modules/starter/node_modules/@angular/router';

import { StarterComponent } from './starter.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Starter Page',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Starter Page' }
      ]
    },
    component: StarterComponent
  }
];

@NgModule({
  imports: [FormsModule, CommonModule, RouterModule.forChild(routes)],
  declarations: [StarterComponent]
})
export class StarterModule {}
