import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { EstadosGenerales } from '../models/EstadosGenerales';

@Component({
  selector: 'app-estados-generales-formulario',
  templateUrl: './estados-generales-formulario.component.html',
  styleUrls: ['./estados-generales-formulario.component.scss']
})
export class EstadosGeneralesFormularioComponent implements OnInit {

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingEstadoGeneralesCategorias: boolean;
  EstadoGeneralesCategorias: any[];

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
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
      nameKey: [null,],
      colorHex: [null,],
      value: [null, [Validators.required]],
      activo: [false, [Validators.required]],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<EstadosGenerales>(DataApi.EstadoGenerales,
      "GetEstadosGeneralesByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("EstadoGenerales no encontrado");
            this.router.navigateByUrl('/mantenimientos/estadogenerales');
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

    this.httpService.DoPostAny<EstadosGenerales>(DataApi.EstadoGenerales,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/estadosgenerales');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



}
