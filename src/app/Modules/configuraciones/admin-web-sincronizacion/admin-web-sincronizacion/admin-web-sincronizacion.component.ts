import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';

@Component({
  selector: 'app-admin-web-sincronizacion',
  templateUrl: './admin-web-sincronizacion.component.html',
  styleUrls: ['./admin-web-sincronizacion.component.scss']
})
export class AdminWebSincronizacionComponent implements OnInit {
  loadingSincronizacionArticulos: boolean;
  loadingSincronizacionRutas: boolean;
  loadingSincronizacionClientes: boolean;

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService) { }

  ngOnInit(): void {
  }

  sincronizarArticulos() {
    this.loadingSincronizacionArticulos = true;

    this.httpService.DoPostAny<any>(DataApi.Articulo,
      "SincronizarArticulosFromSAP", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0])
        } else {
          this.toastService.success("Actualizado", "OK")
        }

        this.loadingSincronizacionArticulos = false;
      }, error => {
        this.loadingSincronizacionArticulos = false;
        this.toastService.error("No se pudo actualizar los artículos.", "Error conexion al servidor");
      });
  }


  sincronizarRutas() {
    this.loadingSincronizacionRutas = true;

    this.httpService.DoPostAny<any>(DataApi.Ruta,
      "GetSapRutas", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0])
        } else {
          this.toastService.success("Actualizado", "OK")
        }

        this.loadingSincronizacionRutas = false;
      }, error => {
        this.loadingSincronizacionRutas = false;
        this.toastService.error("No se pudo actualizar los precios.", "Error conexion al servidor");
      });
  }

  sincronizarClientes() {
    this.loadingSincronizacionClientes = true;

    this.httpService.DoPostAny<any>(DataApi.Cliente,
      "GetClientesFromSAP", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0])
        } else {
          this.toastService.success("Actualizado", "OK")
        }

        this.loadingSincronizacionClientes = false;
      }, error => {
        this.loadingSincronizacionClientes = false;
        this.toastService.error("No se pudo actualizar los precios.", "Error conexion al servidor");
      });
  }





  

}
