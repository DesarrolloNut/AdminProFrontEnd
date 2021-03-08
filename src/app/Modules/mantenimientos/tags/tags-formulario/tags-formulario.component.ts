import { Component, OnInit } from '@angular/core';
import { Tag } from '../models/Tag';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Parametro } from 'src/app/core/http/model/Parametro';

@Component({
  selector: 'app-tags-formulario',
  templateUrl: './tags-formulario.component.html',
  styleUrls: ['./tags-formulario.component.scss']
})
export class TagsFormularioComponent implements OnInit {

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

  loadingSucursales: boolean;
  loadingTagEstados: boolean;

  sucursales: ComboBox[] = []
  tagEstados: ComboBox[] = []

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
    this.getSucursales();
    this.getTagEstados();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      descripcion: [null,],
      estadoID: [0,],
      sucursalID: [0,],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Tag>(DataApi.Tag,
      "GetTagByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("Tag no encontrado");
            this.router.navigateByUrl('/mantenimientos/tag');
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
    this.f.nombre.setValue(String(this.f.nombre.value).toUpperCase()) //convertir el nombre a mayuscula
    
    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<Tag>(DataApi.Tag,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/tag');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



  getSucursales() {
    this.loadingSucursales = true;
    let parametros: Parametro[] = [
      { key: "CompaniaID", value: 0 }
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSucursalesByCompania", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sucursales = response.records;
        }
        this.loadingSucursales = false;
      }, error => {
        this.loadingSucursales = false;
        this.toastService.error("No se pudo obtener las sucursales", "Error conexion al servidor");

        setTimeout(() => {
          this.getSucursales()
        }, 1000);

      });
  }


  getTagEstados() {
    this.loadingTagEstados = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTagEstadosComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.tagEstados = response.records;
        }
        this.loadingTagEstados = false;
      }, error => {
        this.loadingTagEstados = false;
        this.toastService.error("No se pudo obtener los estados", "Error conexion al servidor");
      });
  }


}
