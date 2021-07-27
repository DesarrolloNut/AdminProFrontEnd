import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
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

  
  //LISTA 
   diaSemana: Dias[] = new Array<Dias>();
   frecuenciaVisita  : FrecuenciaVisita[] = new Array<FrecuenciaVisita>();
   frecuenciaVisitas : any[];
    
  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder
    ) { }

  ngOnInit() {
   this.getFrecuenciaVisitas();
   this.getDias(this.clientId);
  }
  get f() { return this.FormVisitas.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html


  onSubmit() {
    this.submitted = true;

    if (!this.actualizando)
      this.f.sucursalID.setValue(Number(this.auth.tokenDecoded.groupsid))

    if (this.FormVisitas.invalid)
      return;

    //this.guardarCliente();
  }

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

}
