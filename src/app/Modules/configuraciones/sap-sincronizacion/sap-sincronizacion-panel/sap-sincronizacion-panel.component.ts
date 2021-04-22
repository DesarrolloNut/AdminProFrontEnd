import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';

@Component({
  selector: 'app-sap-sincronizacion-panel',
  templateUrl: './sap-sincronizacion-panel.component.html',
  styleUrls: ['./sap-sincronizacion-panel.component.scss']
})
export class SapSincronizacionPanelComponent implements OnInit {

  loadingSincronizacionListaPrecios: boolean = false;
  loadingSincronizacionArticulos: boolean;
  loadingSincronizacionPrecioArticulos: boolean;
  loadingProcesarNotaCreditoProntoPago: boolean;

  constructor(
    private toastService: ToastrService,
    private modalService: NgbModal,
    private httpService: BackendService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  openModal(content) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false });
  }

  sincronizarListasPrecios() {
    this.loadingSincronizacionListaPrecios = true;

    this.httpService.DoPostAny<any>(DataApi.ListaPrecio,
      "UpdateAllSAP", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0])
        } else {
          this.toastService.success("Actualizado", "OK")
        }

        this.loadingSincronizacionListaPrecios = false;
      }, error => {
        this.loadingSincronizacionListaPrecios = false;
        this.toastService.error("No se pudo actualizar listas de precios.", "Error conexion al servidor");
      });
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

  
  sincronizarPrecioArticulos() {
    this.loadingSincronizacionPrecioArticulos = true;

    this.httpService.DoPostAny<any>(DataApi.Articulo,
      "ActualizaArticuloPrecioSAP", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0])
        } else {
          this.toastService.success("Actualizado", "OK")
        }

        this.loadingSincronizacionPrecioArticulos = false;
      }, error => {
        this.loadingSincronizacionPrecioArticulos = false;
        this.toastService.error("No se pudo actualizar los precios.", "Error conexion al servidor");
      });
  }

  procesarNotaCreditoProntoPago() {
    this.loadingProcesarNotaCreditoProntoPago = true;

    this.httpService.DoPostAny<any>(DataApi.NotaCredito,
      "SAPProntoPago", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0])
        } else {
          this.toastService.success("Actualizado", "OK")
        }

        this.loadingProcesarNotaCreditoProntoPago = false;
      }, error => {
        this.loadingProcesarNotaCreditoProntoPago = false;
        this.toastService.error("No se pudo actualizar los precios.", "Error conexion al servidor");
      });
  }



}
