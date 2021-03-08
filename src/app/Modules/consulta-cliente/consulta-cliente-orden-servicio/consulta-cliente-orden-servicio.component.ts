import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { OrdenServicioViewModel } from '../../servicios/recepcion/models/OrdenServicioViewModel';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';

@Component({
  selector: 'app-consulta-cliente-orden-servicio',
  templateUrl: './consulta-cliente-orden-servicio.component.html',
  styleUrls: ['./consulta-cliente-orden-servicio.component.scss']
})
export class ConsultaClienteOrdenServicioComponent implements OnInit {


  Cargando: boolean = false;
  orden: OrdenServicioViewModel = new OrdenServicioViewModel();
  citaIDEncriptada: string = "";
  imageSrcSeleccionada: string = "";


  constructor(
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthenticationService) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      this.citaIDEncriptada = params.get("id");
      this.getOrdenByCitaID(this.citaIDEncriptada);
    })
  }

  getOrdenByCitaID(citaID: string) {

    this.Cargando = true;

    this.httpService.DoPostAny<OrdenServicioViewModel>(DataApi.Recepcion,
      "GetOrdenServicioReporte", Number(citaID)).subscribe(response => {

        if (!response.ok) {
          this.router.navigateByUrl("404");

        } else {
          if (response.records != null && response.records.length > 0) {
            this.orden = response.records[0];
            console.log(this.orden);
            console.table(this.orden.compania);
          } else {
            this.router.navigateByUrl("404");
          }
        }
        this.Cargando = false;

      }, error => {
        this.Cargando = false;
        this.router.navigateByUrl("error/505");
        this.toastr.error("No se pudo obtener el reporte.", "Error conexión servidor.");
      });
  }

}
