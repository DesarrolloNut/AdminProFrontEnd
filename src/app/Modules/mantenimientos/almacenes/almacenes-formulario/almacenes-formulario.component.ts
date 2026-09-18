import { AuthenticationService } from './../../../../core/authentication/service/authentication.service';
import { Component, OnInit } from '@angular/core';
import { Almacen } from '../models/Almacen';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ComboBox } from 'src/app/shared/model/ComboBox';

@Component({
  selector: 'app-almacenes-formulario',
  templateUrl: './almacenes-formulario.component.html',
  styleUrls: ['./almacenes-formulario.component.scss']
})
export class AlmacenesFormularioComponent implements OnInit {

  sucursales: ComboBox[] = [];

  loadingSucursales = false;

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

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

    this.getSucursales()
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      codigoReferencia: [null, Validators.required],
      sucursalID: [null, Validators.required],
      descripcion: [null,],
      estado: [0,],
      companiaID:[Number(this.auth.tokenDecoded.primarygroupsid)]
    });
  }


  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Almacen>(DataApi.Almacen,
      "GetAlmacenByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
           
          } else {
            this.toastService.warning("Almacen no encontrado");
            this.router.navigateByUrl('/mantenimientos/almacen');
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

    this.httpService.DoPostAny<Almacen>(DataApi.Almacen,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/almacen');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



  getSucursales() {
    this.loadingSucursales = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSucursales", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sucursales = response.records;
          //console.log(this.sucursales);
        }
        this.loadingSucursales = false;
      }, error => {
        this.loadingSucursales = false;
        this.toastService.error("No se pudo obtener las compañias", "Error conexion al servidor");

        setTimeout(() => {
          this.getSucursales()
        }, 1000);

      });
  }



}
