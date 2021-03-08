import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HerramientasRoutingModule } from './herramientas-routing.module';
import { HerramientasComponent } from './herramientas.component';
import { MinutaComponent } from './Minutas/minuta/minuta.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { MinutasFormComponent } from './Minutas/minutas-form/minutas-form.component';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [HerramientasComponent, MinutaComponent, MinutasFormComponent,],
  imports: [
    CommonModule, FormsModule,NgbAccordionModule,
    HerramientasRoutingModule,
    SharedModule
  ]
})
export class HerramientasModule { }
