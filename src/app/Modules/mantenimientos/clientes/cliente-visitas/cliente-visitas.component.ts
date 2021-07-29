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
import { FrecuenciaVisita } from '../models/FrecuenciaVisita';

@Component({
  selector: 'app-cliente-visitas',
  templateUrl: './cliente-visitas.component.html',
  styleUrls: ['./cliente-visitas.component.scss']
})
export class ClienteVisitasComponent implements OnInit {
  @Input() clientId = 0;
  FormVisitas: FormGroup;

  //BOOLEANOS
   cargando           = false;
   submitted          = false;
   btnGuardarCargando = false;
   actualizando       = false;
   cargandoTiposRuta  = false;
   cargadoRutas       = false;
  
  //LISTA 
   diaSemana: Dias[] = new Array<Dias>();
   frecuenciaVisita  : FrecuenciaVisita[] = new Array<FrecuenciaVisita>();
   frecuenciaVisitas : any[];
   tiposRuta         : ComboBox[];
   rutas             : ComboBox[];
    
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
   this.getDias(this.clientId);
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
  
      this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
        'InsertarOActualizarFrecuenciaVisitas', this.FormVisitas.value).subscribe(response => {
          // if (!response.ok) {
          //   this.toastService.error(response.errores[0], "Error");
          //   this.btnGuardarCargando = false;
          // } else {
          //   this.toastService.success("Realizado", "OK");
          //   if(!this.actualizando){
          //     this.onClienteCreado(this.clientId);
          //   }
          //   this.router.navigateByUrl('/mantenimientos/cliente/'+this.clientId);
          // }
          this.btnGuardarCargando = false;

        }, error => {
          this.btnGuardarCargando = false;
          this.toastService.error("Error conexion al servidor");
        });
  
  

  }


  getDias(id: number) {
    this.cargando = true;
    this.httpService.DoPost<Dias>(DataApi.Cliente,
      "GetDias", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          // console.log("api data",response.records);
          this.diaSemana = response.records;
          this.setValueDiaSemana(id);
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
  GetFrecuenciaVisitasByClienteID() {
    this.cargando = true;
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetFrecuenciaVisitasByClienteID", this.FormVisitas.value).subscribe(response => {
        console.log(response);
      }, error => {
        this.cargando = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        // setTimeout(() => {
        //   this.getDias();
        // }, 1000);

      });
  }

  setValueDiaSemana(id: number) {
    let dias = this.diaSemana;

    if (dias != undefined) {
      this.httpService.DoPostAny<ClienteFrecuencia>(DataApi.Cliente,
        "GetClienteByID", id).subscribe(response => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            //validar que existe
            if (response != null && response.records != null && response.records.length > 0) {

              let visitas = response.records[0].visita

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

        }, error => {
          this.toastService.error("Error conexion al servidor");
        });


    }
  }


  //COMBOBOX
  getFrecuenciaVisitas() {
    this.cargando = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetFrecuenciaVisitaComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.frecuenciaVisitas = response.records;
        }
        this.cargando = false;
      }, error => {
        this.cargando = false;
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



  //EVENT METHODS
  onChangeTipoRuta(tp:ComboBox){
    this.getRutas();
  }
}
