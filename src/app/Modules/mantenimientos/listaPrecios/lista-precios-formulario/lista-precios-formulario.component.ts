import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ListaPrecio } from '../models/ListaPrecio';

@Component({
  selector: 'app-lista-precios-formulario',
  templateUrl: './lista-precios-formulario.component.html',
  styleUrls: ['./lista-precios-formulario.component.scss']
})
export class ListaPreciosFormularioComponent implements OnInit {


  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

  grupos: ComboBox[] = []
  estados: ComboBox[] = []
  loadingListasPrecios: boolean;
  listasPrecios: ComboBox[];
  monedas: ComboBox[];
  loadingMonedas: boolean;

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
    this.getListasPrecios()
    this.getMonedas()
    this.llenarCombobox()
  }


  llenarCombobox() {

    for (let i = 0; i < 4; i++) {
      let g = new ComboBox();
      g.codigo = i + 1;
      g.nombre = "Grupo " + g.codigo
      this.grupos.push(g)
    }

    let e1 = new ComboBox()
    e1.codigo = 0;
    e1.nombre = "Desactivado"
    this.estados.push(e1)

    let e2 = new ComboBox()
    e2.codigo = 1;
    e2.nombre = "Activado"
    this.estados.push(e2)

  }

  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      codigoReferencia: [null, [Validators.required]],
      estadoID: [null, [Validators.required]],
      listaBaseID: [null, [Validators.required]],
      monedaDeterminadaID: [null, [Validators.required]],
      grupoID: [null, [Validators.required]],
      factor: [null, [Validators.required]],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<ListaPrecio>(DataApi.ListaPrecio,
      "GetListaPrecioByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("Lista de precio no encontrada");
            this.router.navigateByUrl('/mantenimientos/listasprecios');
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

    this.httpService.DoPostAny<ListaPrecio>(DataApi.ListaPrecio,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/listaprecios');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getListasPrecios() {
    this.loadingListasPrecios = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetListaPreciosComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.listasPrecios = response.records;
        }
        this.loadingListasPrecios = false;
      }, error => {
        this.loadingListasPrecios = false;
        this.toastService.error("No se pudo obtener las listas de precio", "Error conexion al servidor");

        setTimeout(() => {
          this.getListasPrecios()
        }, 1000);

      });
  }

  getMonedas() {
    this.loadingMonedas = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetMonedas", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.monedas = response.records;
        }
        this.loadingMonedas = false;
      }, error => {
        this.loadingMonedas = false;
        this.toastService.error("No se pudo obtener las monedas", "Error conexion al servidor");

        setTimeout(() => {
          this.getMonedas()
        }, 1000);

      });
  }


}
