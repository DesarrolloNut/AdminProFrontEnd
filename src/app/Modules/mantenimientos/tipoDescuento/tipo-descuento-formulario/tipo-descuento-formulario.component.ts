
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Modulo } from '../models/Modulo';
@Component({
  selector: 'app-tipo-descuento-formulario',
  templateUrl: './tipo-descuento-formulario.component.html',
  styleUrls: ['./tipo-descuento-formulario.component.scss']
})
export class TipoDescuentoFormularioComponent implements OnInit {

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
  }
  private CreateForm() {
    this.Formulario = this.formBuilder.group({
      id: [0],
      //companiaId: [Number(this.authService.tokenDecoded.primarygroupsid), [Validators.required]],
      nameKey: [null,[Validators.required]],
      nombre: [null,[Validators.required]],
  
    });
  }
  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Modulo>(DataApi.TipoDescuento,
      "GetTipoDescuentoByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("Registro no encontrada");
            this.router.navigateByUrl('/mantenimientos/tipo-descuento');
          }
      }
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  guardar() {
    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.httpService.DoPostAny<Modulo>(DataApi.TipoDescuento,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/tipo-descuento');
        }
        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  onSubmit() {
    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
    console.log(this.Formulario.value)
    this.guardar();
  }
  transformUperCaseModulo(event:any){
    this.nombre=event.target.value.toUpperCase();
   }
   transformUperCaseModuloKeyName(event:any){
    this.nameKey=event.target.value.toUpperCase();
   }


 









}
