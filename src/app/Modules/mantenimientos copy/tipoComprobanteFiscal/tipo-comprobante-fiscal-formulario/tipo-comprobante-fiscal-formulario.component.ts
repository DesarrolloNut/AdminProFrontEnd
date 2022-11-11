import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { TipoComprobanteFiscal } from '../models/TipoComprobanteFiscal';

@Component({
  selector: 'app-tipo-comprobante-fiscal-formulario',
  templateUrl: './tipo-comprobante-fiscal-formulario.component.html',
  styleUrls: ['./tipo-comprobante-fiscal-formulario.component.scss']
})
export class TipoComprobanteFiscaFormularioComponent implements OnInit {
  companias: ComboBox[] = [];

  loadingCompanias = false;

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  usuarios: ComboBox[];
  loadingUsuarios: boolean;
  loadingAlmacenes: boolean;
  almacenes: ComboBox[];
  loadingNivelAutorizacionCategorias: boolean;
  NivelAutorizacionCategorias: ComboBox[];
  moduloSeleccionado:number;
  mostrarAcceso: string="";
  loadingTipoComprobantes: boolean;
  tipoComprobantes: any;
  loadingTipoAsignacionComprobante: boolean;
  tipoAsignacionComprobante: any;
  tipoAsignacionComprobanteSeleccionado:"";
  valores: any;
  tipoAsignacionId:any;
  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private auth:AuthenticationService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    let id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
   

      this.getItem(id);
      this.actualizando = true;
    }
 
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      serie: [null, [Validators.required, Validators.minLength(4)]],
      codigoReferencia: [null, Validators.required],
      companiaId: [Number(this.auth.tokenDecoded.primarygroupsid),],
    });
  }


  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<TipoComprobanteFiscal>(DataApi.TipoComprobanteFiscal,
      "GetTipoComprobanteFiscalByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("Tipo Comprobante Fiscal no encontrado");
            this.router.navigateByUrl('/mantenimientos/tipo-comprobante-fiscal');
          }
        }
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  onSubmit() {
    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
 
    this.guardar();
  }
  guardar() {
    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;
    this.httpService.DoPostAny<TipoComprobanteFiscal>(DataApi.TipoComprobanteFiscal,
      metodo, this.Formulario.value).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/tipo-comprobante-fiscal');
        }
        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }




 






}
