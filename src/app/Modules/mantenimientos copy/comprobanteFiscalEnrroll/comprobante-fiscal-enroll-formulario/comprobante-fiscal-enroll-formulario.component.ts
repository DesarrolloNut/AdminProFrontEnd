import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ComprobanteEnrroll } from '../models/ComprobanteEnrroll';

@Component({
  selector: 'app-comprobante-fiscal-enroll-formulario',
  templateUrl: './comprobante-fiscal-enroll-formulario.component.html',
  styleUrls: ['./comprobante-fiscal-enroll-formulario.component.scss']
})
export class ComprobanteFiscalEnrollFormularioComponent implements OnInit {
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
      this.getTipoAsignacionComprobante();
      this.getTipoComprobantes();
      this. getRutas();
      this.getSucursales();
      this.getItem(id);
      this.actualizando = true;
    }
    this.getTipoComprobantes();
    this.getTipoAsignacionComprobante();
    //this. getRutas();
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      valorId: [null, [Validators.required]],
      tipoAsignacionComprobanteId: [null, Validators.required],
      tipoComprobanteId: [null, Validators.required],
      codigoReferencia: [null, Validators.required],
      companiaId: [Number(this.auth.tokenDecoded.primarygroupsid),],
    });
  }


  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<ComprobanteEnrroll>(DataApi.ComprobanteEnrroll,
      "GetComprobanteEnrrollByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.patchValue(record);
            const tipoAsgC= this.tipoAsignacionComprobante.find(x=>x.codigo==record.tipoAsignacionComprobanteId).nombre;
            if(tipoAsgC.toUpperCase()==="RUTA")
            {
             this.getRutas()
            }
            else if(tipoAsgC.toUpperCase()==="SUCURSAL")
            {
               this.getSucursales();
            }  
          } else {
            this.toastService.warning("Enrroll no encontrado");
            this.router.navigateByUrl('/mantenimientos/usuario-almacen-enrroll');
          }
        }
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  changeFn(moduloID){
    this.mostrarAcceso= this.NivelAutorizacionCategorias.find(X=>X.codigo==moduloID).nombre.toUpperCase(); 
  }
  onSubmit() {
    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
    if(!this.actualizando)
      this.Formulario.get('tipoAsignacionComprobanteId').setValue(Number(this.tipoAsignacionId));
    this.guardar();
  }
  guardar() {
    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;
    this.httpService.DoPostAny<ComprobanteEnrroll>(DataApi.ComprobanteEnrroll,
      metodo, this.Formulario.value).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/comprobante-fiscal-enrroll');
        }
        this.btnGuardarCargando = false;
      }, () => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getTipoAsignacionComprobanteSeleccionado(event:any){
      this.tipoAsignacionId=(event.target as HTMLInputElement).value.split("|",1)[0];
     const TipoAsignacionNombre=(event.target as HTMLInputElement).value.split("|",2)[1];
     if(TipoAsignacionNombre.toUpperCase()==="RUTA")
     {
      this.getRutas()
     }
     else if(TipoAsignacionNombre.toUpperCase()==="SUCURSAL")
     {
        this.getSucursales();
     }  
  }



  getTipoComprobantes() {
    this.loadingTipoComprobantes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
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

  getRutas() {
    this.loadingTipoComprobantes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutas", null).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
         this.valores = response.records;
        }
        this.loadingTipoComprobantes = false;
      }, () => {
        this.loadingTipoComprobantes = false;
        this.toastService.error("No se pudo obtener los tipos de comprobantes", "Error conexion al servidor");
        setTimeout(() => {
          this.getTipoComprobantes()
        }, 1000);
      });
  }
  getSucursales() {
    this.loadingTipoComprobantes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSucursales", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.valores = response.records;
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

  getTipoAsignacionComprobante() {
    this.loadingTipoAsignacionComprobante = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTipoAsignacionComprobante", null).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.tipoAsignacionComprobante = response.records;
        }
        this.loadingTipoAsignacionComprobante = false;
      }, () => {
        this.loadingTipoAsignacionComprobante = false;
        this.toastService.error("No se pudo obtener los tipos de asignacion comprobantes", "Error conexion al servidor");

        setTimeout(() => {
          this.getTipoAsignacionComprobante()
        }, 1000);
      });
  }






}
