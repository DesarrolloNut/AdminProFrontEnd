import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NullLogger } from '@aspnet/signalr';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Cliente } from '../models/Cliente';
import { ClienteFrecuencia } from '../models/ClienteFrecuencia';
import { Dias } from '../models/Dias';
import { FrecuenciaVisita, FrecuenciaVisitaFormated } from '../models/FrecuenciaVisita';

@Component({
  selector: 'app-cliente-visitas',
  templateUrl: './cliente-visitas.component.html',
  styleUrls: ['./cliente-visitas.component.scss']
})
export class ClienteVisitasComponent implements OnInit {
  @Input() clientId = 0;
  FormVisitas: FormGroup;

  //BOOLEANOS
   cargando               = false;
   submitted              = false;
   btnGuardarCargando     = false;
   actualizando           = false;
   cargandoTiposRuta      = false;
   cargandoFVisitasCombo  = false;
   cargadoRutas           = false;
  
  //LISTA 
   diaSemana: Dias[] = new Array<Dias>();
   frecuenciaVisita  : FrecuenciaVisita[] = new Array<FrecuenciaVisita>();
   frecuenciaVisitas : any[];
   tiposRuta         : ComboBox[];
   rutas             : ComboBox[];
   diasSigla=["L", "M", "MI", "J", "V", "S","D"];

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder
    ) { }

  ngOnInit() {
   this.CreateForm();
   this.getTipoRutas();
   this.getFrecuenciaVisitas();
   
   this.GetFrecuenciaVisitasByClienteID();
  }


  onSubmit() {
    this.f.diasSemana.setValue(this.diaSemana.filter(function (x) {
      return x.select==true;
    }));

    this.submitted = true;
    if (this.FormVisitas.invalid)
      return;
     this.guardarOActualizarFrecuenciaVisita()
  }


    private CreateForm() {

    this.FormVisitas = this.formBuilder.group({
      clienteId: [this.clientId, [Validators.required]],
      rutaId:[0,[Validators.required]],
      tipoRutaId: [0, [Validators.required]],
      frecuenciaVisitaId:[0,[Validators.required]],
      diasSemana:[null,],
    }
     );

  }

  get f() { return this.FormVisitas.controls; }


  guardarOActualizarFrecuenciaVisita(){
    console.log(this.FormVisitas.value);
      this.f.clienteId.setValue(this.clientId);
      console.log(this.clientId);

      this.btnGuardarCargando = true;
  
      this.httpService.DoPostAny<FrecuenciaVisita>(DataApi.ClienteFrecuenciaVisitaRuta,
        'InsertarOActualizarFrecuenciaVisitas', this.FormVisitas.value).subscribe(response => {
          if (!response.ok) {
            this.toastService.error(response.errores[0], "Error");
            this.btnGuardarCargando = false;
          } else {
              if(response.valores[0].cantRegistrados>0){
                this.toastService.success("Realizado", "OK");
              }
          }
          this.btnGuardarCargando = false;

        }, error => {
          this.btnGuardarCargando = false;
          this.toastService.error("Error conexion al servidor");
        });
  
  

  }


 
  GetFrecuenciaVisitasByClienteID() {
    this.cargando = true;
    this.httpService.DoPostAny<FrecuenciaVisita>(DataApi.ClienteFrecuenciaVisitaRuta,
      "GetFrecuenciaVisitasByClienteID", this.FormVisitas.value).subscribe(response => {
       let frecuencia = response.records[0];
      this.getDias(frecuencia.dias);
      this.fillForm(frecuencia)
      }, error => {
        this.cargando = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        // setTimeout(() => {
        //   this.getDias();
        // }, 1000);

      });
  }

  getDias(fv:FrecuenciaVisitaFormated[]) {
    this.cargando = true;
    this.httpService.DoPost<Dias>(DataApi.Cliente,
      "GetDias", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          // console.log("api data",response.records);
          this.diaSemana = response.records;
          if(fv!=null){
            this.setValueDiaSemana(fv);
          }
        }
        this.cargando = false;
      }, error => {
        this.cargando = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        // setTimeout(() => {
        //   this.getDias();
        // }, 1000);

      });
  }
  setValueDiaSemana(cf : FrecuenciaVisitaFormated[]) {
    let dias = this.diaSemana;
    let visitas =cf;
    if (dias != undefined) {
    for (let i = 0; i < dias.length; i++) {
      let dia = dias[i];
      if (visitas) {
        for (let x = 0; x < visitas.length; x++) {
          let visita = visitas[x];

          if (dia.dia == visita.diaId) {
            dia.select = true;
          }

        }
      }

    }
  }
   
  }


  //COMBOBOX
  getFrecuenciaVisitas() {
    this.cargandoFVisitasCombo = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetFrecuenciaVisitaComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.frecuenciaVisitas = response.records;
        }
        this.cargandoFVisitasCombo = false;
      }, error => {
        this.cargandoFVisitasCombo = false;
        this.toastService.error("No se pudo obtener las frecuencias", "Error conexion al servidor");

        setTimeout(() => {
          this.getFrecuenciaVisitas();
        }, 1000);

      });
  }

  getTipoRutas() {
    this.cargandoTiposRuta = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutaTipoComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.tiposRuta = response.records;
        }
        this.cargandoTiposRuta = false;
      }, error => {
        this.cargandoTiposRuta = false;
        this.toastService.error("No se pudo obtener las frecuencias", "Error conexion al servidor");

        setTimeout(() => {
          this.getTipoRutas();
        }, 1000);

      });
  }
  getRutas() {
    this.cargadoRutas = true;
    let parametros: Parametro[] = [{ key: "tipoRuta", value: this.f.tipoRutaId.value }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutasComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.rutas = response.records;
        }
        this.cargadoRutas = false;
      }, error => {
        this.cargadoRutas = false;
        this.toastService.error("No se pudo obtener las frecuencias", "Error conexion al servidor");

        setTimeout(() => {
          this.getRutas();
        }, 1000);

      });
  }


  //LOGIC METHODS
  fillForm(f:FrecuenciaVisita){
    this.f.rutaId.setValue(f.rutaId);
    this.f.frecuenciaVisitaId.setValue(f.frecuenciaVisitaId);
    this.getRutas();
  }
  clearFields(){
    this.f.rutaId.setValue(0);
    this.f.frecuenciaVisitaId.setValue(0);
  }
  //EVENT METHODS
  onChangeTipoRuta(tp:ComboBox){
    this.clearFields();
    this.GetFrecuenciaVisitasByClienteID();
  }
}
