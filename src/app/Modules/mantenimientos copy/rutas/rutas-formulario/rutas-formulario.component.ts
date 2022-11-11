import { AuthenticationService } from './../../../../core/authentication/service/authentication.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { RollUsuario } from 'src/app/shared/enums/RollUsuario';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Ruta, RutaFormulario } from '../models/Ruta';

@Component({
  selector: 'app-rutas-formulario',
  templateUrl: './rutas-formulario.component.html',
  styleUrls: ['./rutas-formulario.component.scss']
})
export class RutasFormularioComponent implements OnInit {



  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingRutatipo: boolean;
  RutaTipo: any[];
  Supervisores: any[];
  Entregador: any[];
  loadingCanales: boolean;
  canales: ComboBox[];
  territorios: ComboBox[];
  loadingTerritorios: boolean;

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private auth:AuthenticationService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    let id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      this.getRuta(id);
      this.actualizando = true;
    }
    this.getRutaTipo();
    this.getSupervisores();
    this.getCanales()
    this.getTerritorios();
    this.getEntregador();
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      tipoRutaId: [null,[Validators.required]],
      canalId: [null, [Validators.required]],
      territorioId:[null,[Validators.required]],
      codigoReferencia: [null, [Validators.required]],
      estado: [true, [Validators.required]],
      despachoDispositivo: [false, [Validators.required]],
      companiaID: [Number(this.auth.tokenDecoded.primarygroupsid)],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getRuta(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<RutaFormulario>(DataApi.Ruta,
      "GetRutaByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("Ruta no encontrado");
            this.router.navigateByUrl('/mantenimientos/ruta');
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
    // console.log(this.Formulario.value);
    this.httpService.DoPostAny<Ruta>(DataApi.Ruta,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/ruta');
        }

        this.btnGuardarCargando = false;
      }, error => {
        console.log(error)
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getCanales() {
    this.loadingCanales = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetCanales", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.canales = response.records;
        }
        this.loadingCanales = false;
      }, error => {
        this.loadingCanales = false;
        this.toastService.error("No se pudo obtener los canales", "Error conexion al servidor");

        setTimeout(() => {
          this.getCanales()
        }, 2000);

      });
  }

  getTerritorios() {
    this.loadingTerritorios = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTerritorios", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.territorios = response.records;
        }
        this.loadingTerritorios = false;
      }, error => {
        this.loadingTerritorios = false;
        this.toastService.error("No se pudo obtener los territorios", "Error conexion al servidor");

        setTimeout(() => {
          this.getTerritorios()
        }, 2000);

      });
  }


  getRutaTipo() {
    this.loadingRutatipo = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutaTipoComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.RutaTipo = response.records;
        }
        this.loadingRutatipo = false;
      }, error => {
        this.loadingRutatipo = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        setTimeout(() => {
          this.getRutaTipo()
        }, 2000);

      });
  }


  getSupervisores() {
    this.loadingRutatipo = true;
    let parametro: Parametro[] = [{ key: "RollID", value: RollUsuario.SUPERVISOR }];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuarioPorRollComboBox", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.Supervisores = response.records;
        }
        this.loadingRutatipo = false;
      }, error => {
        this.loadingRutatipo = false;
        this.toastService.error("No se pudo obtener los supervisores", "Error conexion al servidor");

        setTimeout(() => {
          this.getRutaTipo()
        }, 1000);

      });
  }


  getEntregador() {
    this.loadingRutatipo = true;
    let parametro: Parametro[] = [{ key: "RollID", value: RollUsuario.ENTREGADOR }];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuarioPorRollComboBox", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.Entregador = response.records;
        }
        this.loadingRutatipo = false;
      }, error => {
        this.loadingRutatipo = false;
        this.toastService.error("No se pudo obtener los supervisores", "Error conexion al servidor");

        setTimeout(() => {
          this.getRutaTipo()
        }, 1000);

      });
  }



}
