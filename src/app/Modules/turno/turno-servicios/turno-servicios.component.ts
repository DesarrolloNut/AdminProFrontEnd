import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/component/toast/toast.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-turno-servicios',
  templateUrl: './turno-servicios.component.html',
  styleUrls: ['./turno-servicios.component.scss']
})
export class TurnoServiciosComponent implements OnInit {

  constructor(private toast: ToastrService) { }

  ngOnInit() {
  }
  showNoDisponibleMensaje() {
    this.toast.info("Servicio no disponible.")
  }
}
