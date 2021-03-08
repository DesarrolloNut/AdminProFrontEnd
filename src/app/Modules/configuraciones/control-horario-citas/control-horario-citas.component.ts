import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ControlDiaHora } from './models/ControlDiaHora';
import { ControlDiaHoraListadoViewModel } from './models/ControlDiaHoraListadoViewModel';

@Component({
  selector: 'app-control-horario-citas',
  templateUrl: './control-horario-citas.component.html',
  styleUrls: ['./control-horario-citas.component.scss']
})
export class ControlHorarioCitasComponent implements OnInit {
  sucursales: ComboBox[] = [];
  loadingSucursales = false;
  sucursalSeleccionada: number = 0

  citaTipos: ComboBox[];
  loadingCitaTipos: boolean;

  diasSemana: ComboBox[] = [];
  loadingDiasSemana = false;

  horarios: ControlDiaHoraListadoViewModel[] = []
  horariosAgrupados: { dia: string, horarios: ControlDiaHoraListadoViewModel[] }[] = []
  Cargando: boolean = false;

  horaModel: { hour: number, minute: number } = { hour: 0, minute: 0 };

  // FORMULARIO DEL MODAL

  Formulario: FormGroup;
  submitted = false;
  actualizando = false;
  btnGuardarCargando = false;

  constructor(
    private toastService: ToastrService,
    private modalService: NgbModal,
    private httpService: BackendService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.getSucursales()
    this.getDiasSemana()
    this.getTiposCita()

    this.CreateForm()
  }

  openModal(content) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false });
  }

  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      diaSemanaID: [null, [Validators.required]],
      horaCita: [null, [Validators.required]],
      citaTipoID: [null, Validators.required],
      cantidad: [null, Validators.required],
      estadoID: [null, Validators.required],
      tipoID: [null, Validators.required],
      sucursalID: [null, Validators.required],
    });
  }
  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  onSubmit() {
    this.submitted = true;

    this.f.sucursalID.setValue(this.sucursalSeleccionada)
    let hora = this.horaModel.hour + ':';
    hora = this.horaModel.minute > 9 ? hora + this.horaModel.minute : hora + '0' + this.horaModel.minute;

    this.f.horaCita.setValue(hora)
    this.f.estadoID.setValue(1)
    this.f.tipoID.setValue(1)

    if (this.horaModel.hour < 1) {
      this.toastService.warning("Selecciona una hora válida")
      return
    }

    if (this.Formulario.invalid) {
      return;
    }

    this.guardar();
  }

  guardar() {
    // console.table(this.Formulario.value)
    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    if (!this.actualizando) {
      this.f.id.setValue(0)
    }

    this.httpService.DoPostAny<ControlDiaHora>(DataApi.ControlDiaHora,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.modalService.dismissAll();
          this.getHorarios()
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  nuevoHorario(modal: any) {
    this.Formulario.reset()
    this.submitted = false;
    this.actualizando = false;
    this.openModal(modal);
  }

  editar(item: ControlDiaHoraListadoViewModel, modal: any) {
    this.actualizando = true;
    this.Formulario.reset()
    this.submitted = false;

    let horario: ControlDiaHora = {
      id: item.id,
      diaSemanaID: item.diaSemanaID,
      cantidad: item.cantidad,
      citaTipoID: item.citaTipoID,
      estadoID: item.estadoID,
      horaCita: item.horaCita,
      sucursalID: item.sucursalID,
      tipoID: item.tipoID
    }

    let horaArray = horario.horaCita.split(':')
    this.horaModel.hour = Number(horaArray[0])
    this.horaModel.minute = Number(horaArray[1])

    this.Formulario.setValue(horario)
    this.openModal(modal);
  }

  eliminar(item: ControlDiaHora) {
    console.table(item)
  }

  getHorarios() {
    this.horarios = []
    this.horariosAgrupados = []

    this.Cargando = true;
    let parametros: Parametro[] = [
      { key: "SucursalID", value: this.sucursalSeleccionada }
    ];
    this.httpService.DoPost<ControlDiaHoraListadoViewModel>(DataApi.ControlDiaHora,
      "GetControlDiaHoraListado", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.horarios = response.records
          this.agruparHorarios();
        }

        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("No se pudo obtener los horarios.", "Error conexion al servidor");
      });
  }

  agruparHorarios() {

    this.diasSemana.forEach(d => {
      let horarios = this.horarios.filter(h => h.diaSemanaID == d.codigo)
      if (horarios.length > 0) {
        this.horariosAgrupados.push(
          {
            dia: d.nombre,
            horarios: this.horarios.filter(h => h.diaSemanaID == d.codigo)
          }
        )
      }
    });

  }

  getSucursales() {
    this.loadingSucursales = true;
    let parametros: Parametro[] = [
      {
        key: "CompaniaID",
        value: 0
      }
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
        this.toastService.error("No se pudo obtener las sucursales.", "Error conexion al servidor");
        setTimeout(() => {
          this.getSucursales();
        }, 1000);
      });
  }

  getDiasSemana() {
    this.loadingDiasSemana = true;
    let parametros: Parametro[] = [
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetDiasSemana", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.diasSemana = response.records;
        }

        this.loadingDiasSemana = false;
      }, error => {
        this.loadingDiasSemana = false;
        this.toastService.error("No se pudo obtener los dias.", "Error conexion al servidor");
        setTimeout(() => {
          this.getDiasSemana();
        }, 1000);
      });
  }

  getTiposCita() {
    this.loadingCitaTipos = true;
    let parametros: Parametro[] = [
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTipoCitaComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.citaTipos = response.records;
        }

        this.loadingCitaTipos = false;
      }, error => {
        this.loadingCitaTipos = false;
        this.toastService.error("No se pudo obtener los tipos de cita.", "Error conexion al servidor");
        setTimeout(() => {
          this.getTiposCita();
        }, 1000);
      });
  }







}
