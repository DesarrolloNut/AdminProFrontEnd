import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
import { FrecuenciaVisita, FrecuenciaVisitaFormated, FrecuenciaVisitaResponse } from '../models/FrecuenciaVisita';

@Component({
  selector: 'app-cliente-visitas',
  templateUrl: './cliente-visitas.component.html',
  styleUrls: ['./cliente-visitas.component.scss']
})
export class ClienteVisitasComponent implements OnInit {
  @Input() clientId = 0;
  @Input() isnotNecesaryFieldsComplete = false;
  @Output()isnotNecesaryFieldsCompleteO = new EventEmitter<boolean>();
  @Output() goTabByKey = new EventEmitter<string>();

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
   diasSigla=["D","L", "M", "MI", "J", "V", "S"];

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
      usuarioId: [Number(this.auth.tokenDecoded.nameid)],
      companiaId:[Number(this.auth.tokenDecoded.primarygroupsid)],
      rutaId:[0,[Validators.required]],
      tipoRutaId: [1, [Validators.required]],
      frecuenciaVisitaId:[0,[Validators.required]],
      diasSemana:[null,],
    }
     );

  }

  get f() { return this.FormVisitas.controls; }


  guardarOActualizarFrecuenciaVisita(){
      let diasArr:any[]= this.f.diasSemana.value;
      if(diasArr.length<=0){
        this.toastService.warning("Debe seleccionar al menos un dia de visita");
        return;
      }

      this.f.clienteId.setValue(this.clientId);
      this.btnGuardarCargando = true;

      this.httpService.DoPostAny<FrecuenciaVisita>(DataApi.ClienteFrecuenciaVisitaRuta,
        'InsertarOActualizarFrecuenciaVisitas', this.FormVisitas.value).subscribe(response => {
          if (!response.ok) {
            this.toastService.error(response.errores[0], "Error");
            this.btnGuardarCargando = false;
          } else {
              if(response.valores?.length>0){

                let f:FrecuenciaVisitaResponse= response.valores[0];

                 if(f.countId>0){
                  let v= f.clienteTabsValida.tabsValida.find(x=>x.keyName=='VISITAS_RUTA')
                  this.isnotNecesaryFieldsComplete= v.ok;
                  this.isnotNecesaryFieldsCompleteO.emit(v.ok);
                   this.toastService.success("Realizado", "OK");
                 }
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

          if (dia.id == visita.diaId) {
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
        this.toastService.error("No se pudo obtener las rutas", "Error conexion al servidor");

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
    this.rutas=[];
    this.clearFields();
    this.GetFrecuenciaVisitasByClienteID();
  }
}
