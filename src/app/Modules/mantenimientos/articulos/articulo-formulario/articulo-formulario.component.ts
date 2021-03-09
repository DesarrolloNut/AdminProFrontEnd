import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';

@Component({
  selector: 'app-articulo-formulario',
  templateUrl: './articulo-formulario.component.html',
  styles: []
})
export class ArticuloFormularioComponent implements OnInit {
  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

  companias: ComboBox[] = [];
  modelos: ComboBox[];

  loadingCompanias = false;
  loadingModelos: boolean;
  loadingMarcas: boolean;
  marcas: ComboBox[];



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

    this.getCompanias()
    this.getMarcas()
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      descripcion: [null,],
      companiaID: [null, Validators.required],
      codigoReferencia: [null, Validators.required],
      marcaID: [0,],
      modeloID: [0,],
      anio: [0],
      chasis: ['',],
      placa: ['',],
      tipoVehiculoID: [0,],
      vehiculoVersionID: [0,],
      tipoArticuloID: [0,],
      fleteID: [0,],
      monedaID: ["",],
      paisID: [0,],
      estadoID: [0,],
      pcvID: [0,],
      colorID: [0,],
      costo: [0,],
      precio: [0,],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Articulo>(DataApi.Articulo,
      "GetArticuloByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
            let marcaID = Number(this.f.marcaID.value);
            this.getModelosByMarcaID(marcaID)
          } else {
            this.toastService.warning("Articulo no encontrado");
            this.router.navigateByUrl('/mantenimientos/articulo');
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

    this.httpService.DoPostAny<Articulo>(DataApi.Articulo,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/articulo');
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

  getMarcas() {
    this.loadingMarcas = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetMarcas", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.marcas = response.records;
        }
        this.loadingMarcas = false;
      }, error => {
        this.loadingMarcas = false;
        this.toastService.error("No se pudo obtener las marcas", "Error conexion al servidor");

        setTimeout(() => {
          this.getMarcas()
        }, 1000);

      });
  }

  onSelectMarca(marcaID: number) {
    this.f.modeloID.setValue(null)
    this.getModelosByMarcaID(marcaID)
  }

  getModelosByMarcaID(marcaID: number) {
    let parametro: Parametro[] = [{ key: "marcaid", value: marcaID }]
    this.loadingModelos = true;

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetModelosByCompaniaID", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.modelos = response.records;
        }
        this.loadingModelos = false;
      }, error => {
        this.loadingModelos = false;
        this.toastService.error("No se pudo obtener los modelos", "Error conexion al servidor");

        setTimeout(() => {
          this.getModelosByMarcaID(marcaID)
        }, 1000);

      });
  }



}
