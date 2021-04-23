import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { NotaCredito } from '../models/NotaCredito';

@Component({
  selector: 'app-notacredito-formulario',
  templateUrl: './notacredito-formulario.component.html',
  styleUrls: ['./notacredito-formulario.component.scss']
})
export class NotacreditoFormularioComponent implements OnInit {



  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingNotaCreditoCategorias: boolean;
  tipoNotaCreditoCategorias: any[] = [{codigo: 'S', nombre: 'Servicio'}, {codigo: 'A', nombre: 'Articulo'}];
  sinMovimientoInventarioCategorias: any[] = [{codigo: 0, nombre: 'Afectar Inventario'}, {codigo: 1, nombre: 'No Afectar Inventario'}];

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
   // this.getNotaCreditoCategorias()
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      descripcion: [null,],
      codigoReferencia: [null, [Validators.required]],
      categoriaID: [null, [Validators.required]],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<NotaCredito>(DataApi.NotaCredito,
      "GetNotaCreditoByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("NotaCredito no encontrado");
            this.router.navigateByUrl('/mantenimientos/sintoma');
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

    this.httpService.DoPostAny<NotaCredito>(DataApi.NotaCredito,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/sintoma');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  // getNotaCreditoCategorias() {
  //   this.loadingNotaCreditoCategorias = true;
  //   this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
  //     "GetNotaCreditoCategoriasComboBox", null).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         //this.sintomaCategorias = response.records;
  //       }
  //       this.loadingNotaCreditoCategorias = false;
  //     }, error => {
  //       this.loadingNotaCreditoCategorias = false;
  //       this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

  //       setTimeout(() => {
  //         this.getNotaCreditoCategorias()
  //       }, 1000);

  //     });
  // }


}
