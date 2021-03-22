import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Promocion } from '../models/Promocion';

@Component({
  selector: 'app-promociones-formulario',
  templateUrl: './promociones-formulario.component.html',
  styleUrls: ['./promociones-formulario.component.scss']
})
export class PromocionesFormularioComponent implements OnInit {

  companias: ComboBox[] = [];

  loadingCompanias = false;

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingArticulos: boolean;
  articulos: any[];
  listasPrecios: ComboBox[];
  loadingListasPrecios: boolean;

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
    this.getArticulos()
    this.getListaPreciosComboBox()
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      descripcion: [null,],
      articuloPromocionID: [null, Validators.required],
      cantidadPromocion: [null, Validators.required],
      articuloEntregaID: [null, Validators.required],
      cantidadEntrega: [null, Validators.required],
      fechaDesde: [null, Validators.required],
      fechaHasta: [null, Validators.required],
      listaPrecioID: [null, Validators.required],
      estadoID: [0,],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Promocion>(DataApi.Promocion,
      "GetPromocionByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("Promoción no encontrada");
            this.router.navigateByUrl('/mantenimientos/promocion');
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

    this.httpService.DoPostAny<Promocion>(DataApi.Promocion,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/promocion');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getArticulos() {
    this.loadingArticulos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetArticulos", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articulos = response.records
        }
        this.loadingArticulos = false;
      }, error => {
        this.loadingArticulos = false;
        this.toastService.error("No se pudo obtener todos los articulos", "Error conexion al servidor");

        setTimeout(() => {
          this.getArticulos()
        }, 1000);

      });
  }


  getListaPreciosComboBox() {
    this.loadingListasPrecios = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetListaPreciosComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.listasPrecios = response.records
        }
        this.loadingListasPrecios = false;
      }, error => {
        this.loadingListasPrecios = false;
        this.toastService.error("No se pudo obtener las listas de precios", "Error conexion al servidor");

        setTimeout(() => {
          this.getArticulos()
        }, 1000);

      });
  }



}
