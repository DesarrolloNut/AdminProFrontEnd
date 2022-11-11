import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {  FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import Swal from 'sweetalert2';
import { FrecuenciaVisitaCliente } from '../models/ClienteFrecuencia';
import { Dias } from '../models/Dias';
import { FrecuenciaVisita, FrecuenciaVisitaFormated } from '../models/FrecuenciaVisita';

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
   frecuenciaVisitaCliente:FrecuenciaVisitaCliente[];
   frecuenciaVisitas : any[];
   tiposRuta         : ComboBox[];
   rutas             : ComboBox[];
   diasSigla=["D","L", "M", "MI", "J", "V", "S"];
  noSePuedeAgregarMasRutas:boolean;

  info: any;
  paginaSize: 5;
  Cargando: boolean;
  paginaNumeroActual: 0;
  rutasExistentes: any[];

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder
    ) { }

  ngOnInit() {
    this.CreateForm();
   this.GetFrecuenciaVisitasByClienteID();
   this.getTipoRutas();
   this.getFrecuenciaVisitas();
   this.getRutas(0);
  }
  onSubmit() {
    this.submitted = true;
    if (this.FormVisitas.invalid)
      {
        this.toastService.error("Algunas informaciones no estan validas");
        return;
      }
     this.guardarOActualizarFrecuenciaVisita();
  }
    private CreateForm() {
    this.FormVisitas = this.formBuilder.group({
      rutas: new FormArray([]),
    });
  }

  get f() { return this.FormVisitas.controls; }
  get r() { return this.f.rutas as FormArray; }

  get lasRutas(): FormArray {
    return <FormArray>this.FormVisitas.get('rutas');
  }
  addRuta(ruta: any) {
    this.lasRutas.push(this.onAddRuta(ruta));
  }
  onAddRuta(rRuta?:any) : FormGroup{
    if(this.tiposRuta!=undefined || this.tiposRuta!=null )
    {
        if( this.lasRutas.length >= this.tiposRuta.length)
          {
            this.noSePuedeAgregarMasRutas=true;
            return;
          }
    }
    if(rRuta==undefined || rRuta==null){
      
      (this.f.rutas as FormArray).push(
        this.formBuilder.group({
        id:[0],
        clienteId: [this.clientId, [Validators.required]],
        usuarioId: [Number(this.auth.tokenDecoded.nameid)],
        companiaId:[Number(this.auth.tokenDecoded.primarygroupsid)],
        rutaId:[null,[Validators.required]],
        tipoRutaId: [null, [Validators.required]],
        frecuenciaVisitaId:[null,[Validators.required]],
        visitaLunes:[false,],
        visitaMartes:[false,],
        visitaMiercoles:[false,],
        visitaJueves:[false,],
        visitaViernes:[false,],
        visitaSabado:[false,],
        visitaDomingo:[false,],
        cargando: [false],
      } ,
      ))
    }
    else{
   return  this.formBuilder.group({
        id:[0],
        clienteId: [this.clientId, [Validators.required]],
        usuarioId: [Number(this.auth.tokenDecoded.nameid)],
        companiaId:[Number(this.auth.tokenDecoded.primarygroupsid)],
        rutaId:[rRuta.rutaId,[Validators.required]],
        tipoRutaId: [rRuta.tipoRutaId, [Validators.required]],
        frecuenciaVisitaId:[rRuta.frecuenciaVisitaId,[Validators.required]],
        visitaLunes:[rRuta.visitaLunes,],
        visitaMartes:[rRuta.visitaMartes,],
        visitaMiercoles:[rRuta.visitaMiercoles,],
        visitaJueves:[rRuta.visitaJueves,],
        visitaViernes:[rRuta.visitaViernes,],
        visitaSabado:[rRuta.visitaSabado,],
        visitaDomingo:[rRuta.visitaDomingo,],
        cargando: [false],
      },)
    }
  }
  guardarOActualizarFrecuenciaVisita(){
      this.btnGuardarCargando = true;
      this.httpService.DoPostAny<FrecuenciaVisita>(DataApi.ClienteFrecuenciaVisitaRuta,
        'InsertarOActualizarFrecuenciaVisitas', this.FormVisitas.value).subscribe(response => {
          if (!response.ok) {
            this.toastService.error(response.errores[0], "Error");
            this.btnGuardarCargando = false;
          } else {
            this.toastService.success("Realizado", "OK");
            
          }
          this.btnGuardarCargando = false;

        }, error => {
          this.btnGuardarCargando = false;
          this.toastService.error("Error conexion al servidor");
        });
  }

  removeRuta(index) {
    (this.f.rutas as FormArray).removeAt(index);
  }

  GetFrecuenciaVisitasByClienteID() {
    let parametros = new FrecuenciaVisitaFormated();
    parametros.clienteId =this.clientId;
    parametros.companiaId =Number(this.auth.tokenDecoded.primarygroupsid);
    this.httpService.DoPostAny<any>(DataApi.ClienteFrecuenciaVisitaRuta,
      "GetRutasPorCliente", parametros).subscribe(response => {
       let frecuencia = response.records[0];
       this.rutasExistentes=response.records;
       console.log(this.rutasExistentes)
       this.info = this.rutasExistentes;
       this.info.forEach(ruta => {
         this.addRuta(ruta)
       })
      this.getDias(frecuencia.dias);
      }, error => {
        this.cargando = false;
        this.toastService.error("No se pudo obtener las rutas", "Error conexion al servidor");
      });
  }

  getDias(fv:FrecuenciaVisitaFormated[]) {
    this.httpService.DoPost<Dias>(DataApi.Cliente,
      "GetDias", null).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.diaSemana = response.records;
          if(fv!=null){
          }
        }
        this.cargando = false;
      }, error => {
        this.cargando = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");
      });
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
          console.log(this.tiposRuta);
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
  getRutas(tipoRuta?:number) {
    this.cargadoRutas = true;
    let parametros: Parametro[] = [{ key: "tipoRuta", value: tipoRuta}]
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
      });
  }
  //EVENT METHODS
  onChangeTipoRuta(tp:ComboBox,index:number){
  let tiposDeRutasQueExisten = (this.lasRutas.value.map(v => v.tipoRutaId));
  tiposDeRutasQueExisten.splice(tiposDeRutasQueExisten.indexOf(tp.codigo), 1);
      if(tiposDeRutasQueExisten.includes(tp.codigo))
      {
        this.toastService.error("Este Tipo de ruta ya existe");
        this.removeRuta(index);
        this.noSePuedeAgregarMasRutas=false;
        return;
      }
  }
  eliminarRuta(ruta:any,index:number){
      Swal.fire({
    title: 'Estas seguro que quieres eliminar esta ruta?',
    text: 'Luego de ser confirmado no se puedo desahacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'SI',
    cancelButtonText: 'NO'
  }).then((result) => {
    if (result.value) {
      this.removeRuta(index);
      if( (this.f.rutas as FormArray).length < this.tiposRuta.length)
      {
        this.noSePuedeAgregarMasRutas=false;
      }

    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire(
        'Cancelado',
        'Se ha cancelado la operacion.)',
        'error'
      )
    }
  })

  }
  
  buscarRuta(index:number){
    if(this.r.value[index].tipoRutaId != null)
    {
      this.getRutas(this.r.value[index].tipoRutaId);
    }
   
  }
}
