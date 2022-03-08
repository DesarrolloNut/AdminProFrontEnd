import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PedidosEmpleadoFormularioComponent } from '../pedidos-empleado-formulario/pedidos-empleado-formulario.component';


@Component({
  selector: 'app-pedidos-empleado-pedido-modal',
  template: ''
})
export class PedidosEmpleadoPedidoModalComponent implements OnDestroy{

  destroy = new Subject<any>();
  currentDialog = null;

  constructor(
    private modalService: NgbModal,
    route: ActivatedRoute,
    router: Router,
    // private logger: NGXLogger
  ) {
    route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
      //  console.log(params)
      // When router navigates on this component is takes the params and opens up the top-shelf-   detail modal
      // this.currentDialog = this.modalService.open(PedidosEmpleadoFormularioComponent, { windowClass: "myCustomModalClass", backdrop: "static" });
        this.currentDialog = this.modalService.open(PedidosEmpleadoFormularioComponent,
           { windowClass: "myCustomModalClass",});



      this.currentDialog.componentInstance.catName = params.catName;
      this.currentDialog.componentInstance.cmsID = params.cmsID;
      // Go back to home page after the modal is closed
      this.currentDialog.result.then(result => {
        router.navigateByUrl('ventas/pedidos-empleado');
      }, reason => {
         router.navigateByUrl('ventas/pedidos-empleado');
         this.currentDialog.close();
      });
   });
  }
   ngOnDestroy()
   {
     this.destroy.next();
   }
}









