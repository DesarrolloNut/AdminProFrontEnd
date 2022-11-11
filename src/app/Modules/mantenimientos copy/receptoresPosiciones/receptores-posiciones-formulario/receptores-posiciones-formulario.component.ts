import { Component, OnInit } from '@angular/core';
import { PosicionRecepcion } from '../models/PosicionRecepcion';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Parametro } from 'src/app/core/http/model/Parametro';

@Component({
  selector: 'app-receptores-posiciones-formulario',
  templateUrl: './receptores-posiciones-formulario.component.html',
  styleUrls: ['./receptores-posiciones-formulario.component.scss']
})
export class ReceptoresPosicionesFormularioComponent implements OnInit {


  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

  loadingSucursales: boolean;
  loadingReceptores: boolean;

  sucursales: ComboBox[] = []
  receptores: ComboBox[] = []

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
    this.getReceptores();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      usuarioID: [0, [Validators.required]],
      sucursalID: [0, Validators.required],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<PosicionRecepcion>(DataApi.PosicionRecepcion,
      "GetPosicionRecepcionByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("Posición no encontrada");
            this.router.navigateByUrl('/mantenimientos/receptor-posicion');
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

    this.httpService.DoPostAny<PosicionRecepcion>(DataApi.PosicionRecepcion,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/receptor-posicion');
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

  getReceptores() {
    this.loadingReceptores = true;
    let parametros: Parametro[] = [
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetReceptoresComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.receptores = response.records;
        }
        this.loadingReceptores = false;
      }, error => {
        this.loadingReceptores = false;
        this.toastService.error("No se pudo obtener los receptores", "Error conexion al servidor");

        setTimeout(() => {
          this.getReceptores()
        }, 1000);

      });
  }





}
