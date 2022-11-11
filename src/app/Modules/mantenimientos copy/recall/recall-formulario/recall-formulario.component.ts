import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Accesorio } from 'src/app/Modules/servicios/recepcion/models/Accesorio';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Recall } from '../models/Recall';

@Component({
  selector: 'app-recall-formulario',
  templateUrl: './recall-formulario.component.html',
  styleUrls: ['./recall-formulario.component.scss']
})
export class RecallFormularioComponent implements OnInit {

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

  recallSintomas: ComboBox[] = []
  loadingRecallSintomas: boolean;
  chasis: ComboBox[] = []
  loadingChasis: boolean;
  Search: string = "";
  loadingRecallEstados: boolean;
  recallEstados: ComboBox[];



  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    let id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      this.getItem(id);
      this.actualizando = true;
    }
    this.CreateForm();
    this.getChasisComboBox();
    this.getRecallSintomas();
    this.getRecallEstados();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      sintomaID: [null, [Validators.required]],
      articuloID: [null, [Validators.required]],
      codigoReferencia: [null, [Validators.required]],
      estadoID: [null, [Validators.required]],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Recall>(DataApi.Recall,
      "GetRecallByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
            this.getChasisComboBox('', response.records[0].articuloID);
          } else {
            this.toastService.warning("Recall no encontrado");
            this.router.navigateByUrl('/mantenimientos/recall');
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
    // this.f.estadoID.setValue(0)

    console.table(this.Formulario.value)
    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<Recall>(DataApi.Recall,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/recall');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



  getRecallSintomas() {
    this.loadingRecallSintomas = true;

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRecallSintomasComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.recallSintomas = response.records;
        }
        this.loadingRecallSintomas = false;
      }, error => {
        this.loadingRecallSintomas = false;
        this.toastService.error("No se pudo obtener los recalls", "Error conexion al servidor");

        setTimeout(() => {
          this.getRecallSintomas()
        }, 1000);

      });
  }

  getRecallEstados() {
    this.loadingRecallEstados = true;

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRecallEstados", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.recallEstados = response.records;
        }
        this.loadingRecallEstados = false;
      }, error => {
        this.loadingRecallEstados = false;
        this.toastService.error("No se pudo obtener los estados recalls", "Error conexion al servidor");

        setTimeout(() => {
          this.getRecallEstados()
        }, 1000);

      });
  }

  getChasisComboBox(searchObj: any = null, articuloID: number = 0) {
    this.loadingChasis = true;

    let search = ""

    if (searchObj)
      search = searchObj.term;

    let parametros: Parametro[] = [
      { key: "CompaniaID", value: this.authService.tokenDecoded.primarygroupsid },
      { key: "Search", value: search },
      { key: "articuloID", value: articuloID },
    ];


    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetChasisComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.chasis = response.records;
        }
        this.loadingChasis = false;
      }, error => {
        this.loadingChasis = false;
        this.toastService.error("No se pudo obtener los chasis", "Error conexion al servidor");

        setTimeout(() => {
          this.getChasisComboBox()
        }, 1000);

      });
  }








}
