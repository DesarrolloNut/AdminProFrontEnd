import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Oferta } from '../../ofertas/models/Oferta';
import { Promocion } from '../models/Promocion';

@Component({
  selector: 'app-promociones-formulario',
  templateUrl: './promociones-formulario.component.html',
  styleUrls: ['./promociones-formulario.component.scss']
})
export class PromocionesFormularioComponent implements OnInit {


  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingArticulos: boolean;
  articulos: any[];
  listasPrecios: ComboBox[];
  loadingListasPrecios: boolean;
  listasCanal: ComboBox[];
  loadingCanal: boolean;
  IsFormDisabled: boolean;
  id: number;
  cargandoAutorizacion: boolean;
  estados: ComboBox[];

  btnClicked: number = 0

  fechaActual: Date;


  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (this.id > 0) {
      this.getItem(this.id);
      this.actualizando = true;
    }
    this.getArticulos()
    this.getListaPreciosComboBox();
    this.getCanalesComboBox();
    this.CreateForm();
    this.getEstados()
    this.getHoraActual()
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
      canalID: [null, Validators.required],
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
            this.IsFormDisabled = record.estadoID > 1;
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
    if (!this.actualizando) {
      this.f.estadoID.setValue(1)
    }

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    console.table(this.Formulario.value)

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
          this.getListaPreciosComboBox();
        }, 1000);

      });
  }

  getCanalesComboBox() {
    this.loadingCanal = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetCanalesComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.listasCanal = response.records
        }
        this.loadingCanal = false;
      }, error => {
        this.loadingCanal = false;
        this.toastService.error("No se pudo obtener las listas de precios", "Error conexion al servidor");

        setTimeout(() => {
          this.getCanalesComboBox();
        }, 1000);

      });
  }


  getEstados() {
    let parametros: Parametro[] = [{
      key: "NameKey",
      value: EstadosGeneralesKeyEnum.PROMOCIONES
    }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadoForKeyComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.estados = response.records;
          console.table(this.estados)
        }
      }, error => {
        this.toastService.error("No se pudo obtener los estados", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstados()
        }, 1000);

      });
  }



  openModal(content, btnClicked: number) {
    this.modalService.open(content, { size: 'sm' });
    this.btnClicked = btnClicked
  }

  onBtnModalOk() {

    if (this.btnClicked == 1) {
      this.desautorizar()
      return;
    }
    if (this.btnClicked == 2) {
      this.solicitarAutorizacion()
      return;
    }
    if (this.btnClicked == 3) {
      this.autorizar()
      return;
    }

  }

  desautorizar() {
    this.cargandoAutorizacion = true;
    this.httpService.DoPostAny<Promocion>(DataApi.Promocion,
      "Desautorizar", this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.modalService.dismissAll()
          this.f.estadoID.setValue(1);
          this.IsFormDisabled = false;

        }

        this.cargandoAutorizacion = false;
      }, error => {
        this.cargandoAutorizacion = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  solicitarAutorizacion() {
    this.cargandoAutorizacion = true;
    this.httpService.DoPostAny<Promocion>(DataApi.Promocion,
      "SolicitarAutorizacion", this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.modalService.dismissAll()
          this.f.estadoID.setValue(2);
          this.IsFormDisabled = true;
        }

        this.cargandoAutorizacion = false;
      }, error => {
        this.cargandoAutorizacion = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  onBtnModalCancel() {

    this.modalService.dismissAll()

  }

  autorizar() {
    this.cargandoAutorizacion = true;
    this.httpService.DoPostAny<Promocion>(DataApi.Promocion,
      "Autorizar", this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.modalService.dismissAll()
          this.f.estadoID.setValue(3);
          this.IsFormDisabled = true;
        }

        this.cargandoAutorizacion = false;
      }, error => {
        this.cargandoAutorizacion = false;
        this.toastService.error("Error conexion al servidor");
      });

  }


  getHoraActual() {
    this.Cargando = true;
    this.httpService.DoPost<ComboBox>(DataApi.Public,
      "GetHoraActual", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.fechaActual = new Date(response.valores[0]);
        }

        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }




}
