import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Permisos } from '../models/Permisos';

@Component({
  selector: 'app-permisos-formulario',
  templateUrl: './permisos-formulario.component.html',
  styleUrls: ['./permisos-formulario.component.scss']
})
export class PermisosFormularioComponent implements OnInit {



  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingPermisosCategorias: boolean;
  PermisosCategorias: any[];

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
    this.getPermisosCategorias()
    this.CreateForm();
  }


  private CreateForm() {
    this.Formulario = this.formBuilder.group({
      id: [0],
      //companiaId: [this.authService.tokenDecoded.primarygroupsid, [Validators.required]],
      nameKey: [null, [Validators.required]],
      nombres: [null, [Validators.required]],
      descripcion: [null,],
      usaAlmacen: [false,],
      tipoDevolucion: [false,],  
      solicitudCambio: [false,], 
      permisoPadreId: [null,  [Validators.required]],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Permisos>(DataApi.Permisos,
      "GetPermisosByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("Permisos no encontrado");
            this.router.navigateByUrl('/mantenimientos/permisos');
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
    //console.log(JSON.stringify(this.Formulario.value));
   this.httpService.DoPostAny<Permisos>(DataApi.Permisos,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/permisos');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getPermisosCategorias() {
    this.loadingPermisosCategorias = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetListaPremisosPadre", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.PermisosCategorias = response.records;
          this.PermisosCategorias.unshift({codigo: 0, nombre: 'Es Padre'})
        }
        this.loadingPermisosCategorias = false;
      }, error => {
        this.loadingPermisosCategorias = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        setTimeout(() => {
          this.getPermisosCategorias()
        }, 1000);

      });
  }


}
