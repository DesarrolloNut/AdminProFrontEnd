import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Minuta } from '../minuta/Minuta';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ToastrService } from 'ngx-toastr';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { AccionMinuta } from '../minuta/accion-minuta';

@Component({
  selector: 'app-minutas-form',
  templateUrl: './minutas-form.component.html',
  styleUrls: ['./minutas-form.component.scss']
})
export class MinutasFormComponent implements OnInit {

  routeId = 0;
  AsistentesCombo = [];
  LugaresCombo: ComboBox[] = [];
  EstadosCombo: ComboBox[] = [];
  responsablesCombo: ComboBox[] = [];
  PresentadoresCombo: ComboBox[] = [];
  btnGuardarCargando = false;
  loadingLugaresCombo = false;
  loadingAsistentesCombo = false;
  loadingPresentadoresCombo = false;
  loadingEstadosCombo = false;
  loadingresponsablesCombo = false;
  Cargando = false;
  submitted = false;
  Formulario: FormGroup;
  secciones: AccionesViewModel[] = [];


  constructor(private route: ActivatedRoute,
    private toastService: ToastrService,
    private router: Router,
    private formBuilder: FormBuilder,
    private httpService: BackendService,
    private authService: AuthenticationService, ) { }

  ngOnInit(): void {
    this.routeId = Number(this.route.snapshot.paramMap.get("id"));

    this.CreateForm();
    if (this.routeId > 0) {
      this.getMinuta();
    }

    this.getLugaresComboBox();
    this.getUsuariosComboBox();

    this.getAccionesMinuta();


    this.EstadosCombo = [
      { nombre: "Activa", grupoID: "", grupo: "", codigo: 1 },
      { nombre: "En proceso", grupoID: "", grupo: "", codigo: 2 },
      { nombre: "Completada", grupoID: "", grupo: "", codigo: 3 },
    ]

  }


  getLugaresComboBox() {
    this.loadingLugaresCombo = true;
    let parametros = [
    ];

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSalonesComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.LugaresCombo = response.records;
          this.LugaresCombo.push({ codigo: 0, nombre: 'Otro', grupo: '', grupoID: "0" })
        }
        this.loadingLugaresCombo = false;

      }, error => {
        this.loadingLugaresCombo = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getUsuariosComboBox() {
    this.loadingAsistentesCombo = true;
    this.loadingPresentadoresCombo = true;
    this.loadingresponsablesCombo = true;
    let parametros = [
    ];

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuariosComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.AsistentesCombo = response.records;
          this.PresentadoresCombo = response.records;
          this.responsablesCombo = response.records;
        }
        this.loadingAsistentesCombo = false;
        this.loadingPresentadoresCombo = false;
        this.loadingresponsablesCombo = false;

      }, error => {
        this.loadingAsistentesCombo = false;
        this.loadingPresentadoresCombo = false;
        this.loadingresponsablesCombo = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getMinuta() {
    this.Cargando = true;
    this.httpService.DoPostAny<AccionesViewModel>(DataApi.Herramientas,
      "GetMinutaById", this.routeId).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            this.Formulario.setValue(response.records[0]);
          } else {
            this.toastService.warning("Minuta no encontrada");
            this.router.navigateByUrl('/herramientas/minutas');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });

  }

  getAccionesMinuta() {
    this.Cargando = true;
    this.httpService.DoPostAny<AccionesViewModel>(DataApi.Herramientas,
      "GetAccionesMinutaByMinutaId", this.routeId).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            // this.Formulario.setValue(response.records[0]);
            this.secciones = response.records;
            console.log(response.records)

          } else {
            this.toastService.warning("Acciones no encontrada");
            // this.router.navigateByUrl('/herramientas/minutas');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });

  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({


      id: [0],
      titulo: ["", [Validators.required]],
      fechaInicio: [null, [Validators.required]],
      fechaFinal: [null, [Validators.required]],
      estatus: [null, [Validators.required]],
      asistenteId: [null, [Validators.required]],
      responsable: [null],
      responsableId: [null, [Validators.required]],
      presentadorId: [null, [Validators.required]],
      lugarId: [null, [Validators.required]],
      sucursalId: [Number(this.authService.tokenDecoded.primarygroupsid)]

    });

  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html


  onSubmit() {

    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }

    this.setMinuta();
  }

  setMinuta() {
    this.btnGuardarCargando = true;


    this.httpService.DoPostAny<Minuta>(DataApi.Herramientas,
      "SetMinuta", this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.toastService.success("Realizado", "OK");

          this.router.navigateByUrl('/herramientas/minutas');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



}



export class AccionesViewModel {

  titulo: string;
  acciones: AccionMinuta[];

}