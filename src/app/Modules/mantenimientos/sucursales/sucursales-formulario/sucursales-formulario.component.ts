import { Component, OnInit } from '@angular/core';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Sucursal } from '../models/Sucursal';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';

@Component({
  selector: 'app-sucursales-formulario',
  templateUrl: './sucursales-formulario.component.html',
  styleUrls: ['./sucursales-formulario.component.scss']
})
export class SucursalesFormularioComponent implements OnInit {


  companias: ComboBox[] = [];

  loadingCompanias = false;

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

    this.getCompanias()
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],

      nombre: [null, [Validators.required]],
      telefono: [null, [Validators.required]],
      referencia: [null,],
      companiaID:[Number( this.auth.tokenDecoded.nameid)]
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Sucursal>(DataApi.Sucursal,
      "GetSucursalByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("Sucursal no encontrada");
            this.router.navigateByUrl('/mantenimientos/sucursal');
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

    this.httpService.DoPostAny<Sucursal>(DataApi.Sucursal,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/sucursal');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



  getCompanias() {
    this.loadingCompanias = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetCompanias", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.companias = response.records;
        }
        this.loadingCompanias = false;
      }, error => {
        this.loadingCompanias = false;
        this.toastService.error("No se pudo obtener las compañias", "Error conexion al servidor");

        setTimeout(() => {
          this.getCompanias()
        }, 1000);

      });
  }



}
