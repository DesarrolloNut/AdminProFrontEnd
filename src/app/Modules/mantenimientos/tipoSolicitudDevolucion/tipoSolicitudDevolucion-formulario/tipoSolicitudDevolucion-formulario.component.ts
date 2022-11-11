
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { TipoSolicitudDevolucion } from '../models/Modulo';


//import { Moneda } from '../models/Moneda';

@Component({
  selector: 'app-tipoSolicitudDevolucion-formulario',
  templateUrl: './tipoSolicitudDevolucion-formulario.component.html',
  styleUrls: ['./tipoSolicitudDevolucion-formulario.component.scss']
})
export class TipoSolicitudDevolucionFormularioComponent implements OnInit {


  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

  loadingDias = false;
  loadingSucursal = false;
  horaValida:any;
  horaExiste = false;
  nombre="";
  nameKey="";
  Modulos: ComboBox[];
  loadingModulos: boolean;



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
   
    this.CreateForm();
    this.getModulos();
  }
  private CreateForm() {
    this.Formulario = this.formBuilder.group({
      id: [0],
      companiaId: [Number(this.authService.tokenDecoded.primarygroupsid), [Validators.required]],
      nombre: [null,[Validators.required]],
      moduloId: [null,[Validators.required]],
  
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<TipoSolicitudDevolucion>(DataApi.TipoSolicitudDevolucion,
      "GetTipoSolicitudDevolucionByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0];
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("Registro no encontrada");
            this.router.navigateByUrl('/mantenimientos/tipo-solicitud-devolucion');
          }
      }
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getModulos() {
    this.loadingSucursal = true;
    let parametros: Parametro[] = [
      { key: "CompaniaId", value: this.authService.tokenDecoded.primarygroupsid }
  ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetModulos",parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.Modulos = response.records;

        }
        this.loadingModulos = false;
      }, error => {
        this.loadingModulos = false;
        this.toastService.error("No se pudo obtener los modulos", "Error conexion al servidor");
      });
  }

  
  transformUperCaseModulo(event:any){
  this.nombre=event.target.value.toUpperCase();
 }
 transformUperCaseModuloKeyName(event:any){
  this.nameKey=event.target.value.toUpperCase();
 }
 //validarHora($event)
  onSubmit() {
    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
 
    this.guardar();
   
  }

  guardar() {
    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.httpService.DoPostAny<TipoSolicitudDevolucion>(DataApi.TipoSolicitudDevolucion,
      metodo, this.Formulario.value).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/tipo-solicitud-devolucion');
        }
        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  eliminarModulo(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<TipoSolicitudDevolucion>(DataApi.Modulo,
      "EliminarModulo", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
            this.toastService.success("Se ha eliminado correctamente el modulo.");
            this.router.navigateByUrl('/mantenimientos/modulo');
         }
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
 









}
