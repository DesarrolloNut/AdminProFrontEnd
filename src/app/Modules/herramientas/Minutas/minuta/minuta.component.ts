import { Component, OnInit } from '@angular/core';
import { Minuta } from './Minuta';
import { ReplaySubject, BehaviorSubject } from 'rxjs';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { ToastService } from 'src/app/component/toast/toast.service';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { AccionMinuta } from './accion-minuta';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ComboBox } from 'src/app/shared/model/ComboBox';

@Component({
  selector: 'app-minuta',
  templateUrl: './minuta.component.html',
  styleUrls: ['./minuta.component.scss']
})
export class MinutaComponent implements OnInit {


  pageSize = 5;
  minutas$: BehaviorSubject<Minuta[]> = new BehaviorSubject<Minuta[]>(null);
  accionMinutas$: BehaviorSubject<AccionMinuta[]> = new BehaviorSubject<AccionMinuta[]>(null);
  EstadosCombo = [];
  AsignadoCombo = [];
  SeccionCombo = [];
  ShowFormAcciones = false;
  submitted = false;


  loadingAsignadoCombo = false;
  loadingSeccionCombo = false;
  loadingEstadosCombo = false;
  btnGuardarCargando = false;


  Formulario: FormGroup;


  Cargando = false;
  paginaNumeroActual = 1;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  arrayLoading = new Array(this.paginaSize);
  Search = "";
  minutaId = 0;
  constructor(private toastr: ToastrService,
    private httpService: BackendService,
    private toast: ToastService,
    private toastService: ToastrService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private authService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this.getMinutas();


    
    this.EstadosCombo = [
      { nombre: "Activa", grupoID: "", grupo: "", codigo: 1 },
      { nombre: "En proceso", grupoID: "", grupo: "", codigo: 2 },
      { nombre: "Completada", grupoID: "", grupo: "", codigo: 3 },
    ]
  }


  getUsuariosComboBox() {
    this.loadingAsignadoCombo = true;
    let parametros = [
    ];

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuariosComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.AsignadoCombo = response.records;
        }
        this.loadingAsignadoCombo = false;

      }, error => {
        this.loadingAsignadoCombo = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getSeccionesComboBox() {
    this.loadingAsignadoCombo = true;
    let parametros = [
    ];

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSeccionesMinutasComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.SeccionCombo = response.records;
        }
        this.loadingAsignadoCombo = false;

      }, error => {
        this.loadingAsignadoCombo = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  private CreateForm(minutaId) {

    this.Formulario = this.formBuilder.group({
      id: [0],
      minutaId: [minutaId],
      accion: ["", [Validators.required]],
      fechaInicio: [null, [Validators.required]],
      fechaFin: [null, [Validators.required]],
      asignadoId: [null, [Validators.required]],
      seccionId: [null, [Validators.required]],
      estatus: [null],
      seccion: [null],
      asignado: [null]

    });

  }

  openAcciones(AccionesModal, minutaId) {
    this.minutaId = minutaId
    this.CreateForm(minutaId);

    this.modalService.open(AccionesModal, { size: 'lg', centered: true });
    this.getAccionMinutas()

  }



  onSubmit() {

    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }

    this.SetAccionMinutas();
  }

  SetAccionMinutas() {
    this.btnGuardarCargando = true;


    this.httpService.DoPostAny<AccionMinuta>(DataApi.Herramientas,
      "SetAccionMinutas", this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.toastService.success("Realizado", "OK");

          // this.router.navigateByUrl('/herramientas/minutas');
          this.getAccionMinutas();
          this.backAcciones();
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  EditAcciones(model:AccionMinuta) {
    this.ShowFormAcciones = !this.ShowFormAcciones;
    this.getSeccionesComboBox();
    this.getUsuariosComboBox();

 this.Formulario = this.formBuilder.group({
      id: [model.id],
      minutaId: [model.minutaId],
      accion: [model.accion, [Validators.required]],
      fechaInicio: [model.fechaInicio, [Validators.required]],
      fechaFin: [model.fechaFin, [Validators.required]],
      asignadoId: [model.asignadoId, [Validators.required]],
      seccionId: [model.seccionId, [Validators.required]],
      estatus: [model.estatus],
      seccion: [model.seccion],
      asignado: [model.asignado]

    });
  }

  createNewAcciones() {

    this.ShowFormAcciones = !this.ShowFormAcciones;
    this.getSeccionesComboBox();
    this.getUsuariosComboBox();


  }

  backAcciones(){
    this.ShowFormAcciones = false;
    
  }

  getAccionMinutas() {

    this.Cargando = true;
    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      { key: "MinutaId", value: this.minutaId }
    ]
    this.httpService.GetAllWithPagination<AccionMinuta>(DataApi.Herramientas, "GetAccionMinutas", "Accion", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {

        if (x.ok) {
          this.accionMinutas$.next(x.records);
          this.asignarPagination(x);
        } else {
          this.toast.Danger(x.errores[0]);
          console.error(x.errores[0]);
        }
        this.arrayLoading = new Array(0);
        this.Cargando = false;
      }, error => {
        console.error(error);
        this.toast.MostrarMensajeDeErrorConexionServidor();
        this.Cargando = false;
        this.arrayLoading = new Array(0);
      });

  }

  getMinutas() {

    this.Cargando = true;
    let parametros: Parametro[] = [{ key: "Search", value: this.Search }]
    this.httpService.GetAllWithPagination<Minuta>(DataApi.Herramientas, "GetMinutas", "FechaInicio", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {

        if (x.ok) {
          this.minutas$.next(x.records);
          this.asignarPagination(x);
        } else {
          this.toast.Danger(x.errores[0]);
          console.error(x.errores[0]);
        }
        this.arrayLoading = new Array(0);
        this.Cargando = false;
      }, error => {
        console.error(error);
        this.toast.MostrarMensajeDeErrorConexionServidor();
        this.Cargando = false;
        this.arrayLoading = new Array(0);
      });

  }

  //#region  asignarPagination
  asignarPagination(x: ResponseContenido<any>) {
    if (x.pagina != null) {
      this.totalPaginas = x.pagina.totalPaginas == null ? 0 : x.pagina.totalPaginas;
      this.paginaTotalRecords = x.pagina.totalRecords == null ? 0 : x.pagina.totalRecords;
      this.paginaSize = x.pagina.paginaSize == null ? 0 : x.pagina.paginaSize;
    } else {
      this.totalPaginas = 0;
      this.paginaTotalRecords = 0;
      this.paginaSize = 0;
    }
  }
  //#endregion
}
