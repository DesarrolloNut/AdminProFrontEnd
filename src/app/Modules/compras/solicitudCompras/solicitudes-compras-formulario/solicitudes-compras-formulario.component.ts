import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Proveedor } from 'src/app/Modules/mantenimientos/proveedores/models/Proveedor';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';

@Component({
  selector: 'app-solicitudes-compras-formulario',
  templateUrl: './solicitudes-compras-formulario.component.html',
  styleUrls: ['./solicitudes-compras-formulario.component.scss']
})
export class SolicitudesComprasFormularioComponent implements OnInit {
  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

  loadingProveedores: boolean;
  proveedores: ComboBox[];

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    let id = Number(this.route.snapshot.paramMap.get('id'));
    this.CreateForm();

    if (id > 0) {
      this.getItem(id);
      this.actualizando = true;
    }

  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      codigoReferencia: [null,],
      departamentoID: [0, [Validators.required]],
      solicitanteID: [0, [Validators.required]],
      sucursalID: [0, [Validators.required]],
      estadoID: [0],
      fechaSolicitud: [new Date()],
      fechaEntrega: [new Date()],
      compradorID: [0],
      proveedorID: [0],
      anexoURL: [null],
      comentario: [null],
    });
  }


  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Proveedor>(DataApi.Proveedor,
      "GetProveedorByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);

          } else {
            this.toastService.warning("Proveedor no encontrado");
            this.router.navigateByUrl('/mantenimientos/proveedor');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  onSubmit() {
    console.table(this.Formulario.value)
    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
    this.guardar();
  }


  guardar() {

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<Proveedor>(DataApi.Proveedor,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/proveedor');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getProveedores() {
    this.loadingProveedores = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetProveedores", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.proveedores = response.records;
        }
        this.loadingProveedores = false;
      }, error => {
        this.loadingProveedores = false;
        this.toastService.error("No se pudo obtener los proveedores", "Error conexion al servidor");

        setTimeout(() => {
          this.getProveedores()
        }, 1000);

      });
  }



}
