import { filter } from 'rxjs/operators';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FocusEventArgs } from '@syncfusion/ej2-angular-calendars';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox, ComboBoxTipoComprobante } from 'src/app/shared/model/ComboBox';
import { ComprobanteFiscal } from '../models/ComprobanteFiscal';
import { ComprobanteFiscalEstadosEnum } from '../models/ComprobanteFiscalEstadosEnum';

@Component({
  selector: 'app-comprobante-fiscal-formulario',
  templateUrl: './comprobante-fiscal-formulario.component.html',
  styleUrls: ['./comprobante-fiscal-formulario.component.scss']
})
export class ComprobanteFiscalFormularioComponent implements OnInit {

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  _serie:string="";

  tipoComprobantes: any;
  loadingTipoComprobantes: boolean;
  fechaActual: Date;
  hayDetalle: boolean;

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    let id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      this.getItem(id);
      this.actualizando = true;
    }

    this.getTipoComprobantes()
    this.getHoraActual()
    this.CreateForm();
  }

  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      serie: [null, [Validators.required, Validators.minLength(4)]],
      tipoComprobanteID: [null, Validators.required],
      secuenciaDesde: [null, [Validators.required, Validators.minLength(7)]],
      secuenciaHasta: [null, [Validators.required, Validators.minLength(7)]],
      fechaVencimiento: [null, Validators.required],
      estadoID: [ComprobanteFiscalEstadosEnum.No_SINCRONIZADO,],
      companiaId: [Number(this.authService.tokenDecoded.primarygroupsid),],
    });
  }


  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<ComprobanteFiscal>(DataApi.ComprobanteFiscal,
      "GetComprobanteFiscalByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
            this.getComprobanteDetalles(id);
          } else {
            this.toastService.warning("No encontrado");
            this.router.navigateByUrl('/mantenimientos/comprobante-fiscal');
          }
        }
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getComprobanteDetalles(comprobanteID: number) {
    this.httpService.DoPostAny<any>(DataApi.ComprobanteFiscal,
      "GetComprobanteDetalles", comprobanteID).subscribe(response => {
        if (!response || !response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          if (response.records) {
            this.hayDetalle=true;
          }
        }
      }, error => {
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }

  onSubmit() {

    this.submitted = true;

    if (this.Formulario.invalid) {
      return;
    }

    if (this.f.secuenciaHasta.value <= this.f.secuenciaDesde.value) {
      this.toastService.warning("Secuencia hasta no puede ser menor a secuencia desde.");
      return;
    }
    console.log(this.Formulario.value);
    this.guardar();
  }


  guardar() {

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<ComprobanteFiscal>(DataApi.ComprobanteFiscal,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/comprobante-fiscal');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



  getTipoComprobantes() {
    this.loadingTipoComprobantes = true;
    this.httpService.DoPost<ComboBoxTipoComprobante>(DataApi.ComboBox,
      "GetTipoComprobante", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.tipoComprobantes = response.records;
        }
        this.loadingTipoComprobantes = false;
      }, error => {
        this.loadingTipoComprobantes = false;
        this.toastService.error("No se pudo obtener los tipos de comprobantes", "Error conexion al servidor");

        setTimeout(() => {
          this.getTipoComprobantes()
        }, 1000);

      });
  }
  getSerie(event){
    const tipoComprobanteId=(event.target as HTMLInputElement).value.split("|",1)[0];
    this._serie=this.tipoComprobantes.find(x=>x.codigo==tipoComprobanteId).otroProp;

  }


  getHoraActual() {
    this.Cargando = true;
    this.httpService.DoPost<ComboBox>(DataApi.Public,
      "GetHoraActual", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.fechaActual = new Date(response.valores[0]);
        }

        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  @ViewChild('default')
  public datepickerObj: any;

  onFocus(args: FocusEventArgs): void {
    this.datepickerObj.show();
  }



}
