import { NivelAutorizacionFormulario } from './../models/NivelAutorizacion';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Parametro } from 'src/app/core/http/model/Parametro';

@Component({
  selector: 'app-nivel-autorizacion-formulario',
  templateUrl: './nivel-autorizacion-formulario.component.html',
  styleUrls: ['./nivel-autorizacion-formulario.component.scss']
})
export class NivelAutorizacionFormularioComponent implements OnInit {


  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingNivelAutorizacionCategorias: boolean;
  loadingEstadoCategorias: boolean;
  NivelAutorizacionCategorias: any[];
  EstadoCategorias: any[];

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
    this.GetNivelAutorizacionModuloComboBox();
    // this.GetEstadosGenerales()
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      nivelAutorizacionModuloId: [0, [Validators.required]],
      estadoId: [0],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<NivelAutorizacionFormulario>(DataApi.NivelAutorizacion,
      "GetNivelAutorizacionByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
            this.GetEstadosGeneralesByModuloID()
          } else {
            this.toastService.warning("NivelAutorizacion no encontrado");
            this.router.navigateByUrl('/mantenimientos/nivelautorizacion');
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

    this.httpService.DoPostAny<NivelAutorizacionFormulario>(DataApi.NivelAutorizacion,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/nivelautorizacion');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  GetNivelAutorizacionModuloComboBox() {
    this.loadingNivelAutorizacionCategorias = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetNivelAutorizacionModuloComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.NivelAutorizacionCategorias = response.records;
        }
        this.loadingNivelAutorizacionCategorias = false;
      }, error => {
        this.loadingNivelAutorizacionCategorias = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        setTimeout(() => {
          this.GetNivelAutorizacionModuloComboBox()
        }, 1000);

      });
  }

  onNivelModuloChange(modulo: ComboBox) {

    this.GetEstadosGeneralesByModuloID()

  }

  // GetEstadoForKeyComboBox() {
  //   this.loadingEstadoCategorias = true;
  //   let parametro: Parametro[] = [{ key: "NameKey", value: this.f.namekey.value }];
  //   this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
  //     "GetEstadoForKeyComboBox", parametro).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         this.EstadoCategorias = response.records;
  //       }
  //       this.loadingEstadoCategorias = false;
  //     }, error => {
  //       this.loadingEstadoCategorias = false;
  //       this.toastService.error("No se pudo obtener los estados", "Error conexion al servidor");

  //       setTimeout(() => {
  //         this.GetEstadoForKeyComboBox()
  //       }, 1000);

  //     });
  // }

  GetEstadosGeneralesByModuloID() {
    this.loadingEstadoCategorias = true;
    let parametro: Parametro[] = [{ key: "moduloID", value: this.f.nivelAutorizacionModuloId.value }];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadosGeneralesByModuloID", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.EstadoCategorias = response.records;
        }
        this.loadingEstadoCategorias = false;
      }, error => {
        this.loadingEstadoCategorias = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        setTimeout(() => {
          this.GetEstadosGeneralesByModuloID()
        }, 1000);

      });
  }

}
