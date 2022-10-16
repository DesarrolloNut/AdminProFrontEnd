import { Sucursal } from './../../sucursales/models/Sucursal';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonHubProtocol } from '@aspnet/signalr';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { HoraPickingViewModel } from '../models/HoraListadoViewModel';
import { HoraPicking } from '../models/HoraPicking';
//import { Moneda } from '../models/Moneda';

@Component({
  selector: 'app-hora-picking-formulario',
  templateUrl: './hora-picking-formulario.component.html',
  styleUrls: ['./hora-picking-formulario.component.scss']
})
export class HoraPickingFormularioComponent implements OnInit {


  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

  loadingDias = false;
  loadingSucursal = false;
  Sucursal: ComboBox[] = [];
  dias: ComboBox[] = [];
  horaValida:any;
  horaExiste = false;
  horaDesde: any;
  horaHasta: any;
  horaD: any;
  horaH: any;

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
      this.getSucursal();
      this.getItem(id);

      this.actualizando = true;
    }
    this.getDias();
    this.getSucursal();
    this.CreateForm();
  }
  private CreateForm() {
    this.Formulario = this.formBuilder.group({
      id: [0],
      sucursalId:[null, [Validators.required]],
      diaId: [null, [Validators.required]],
      companiaId: [this.authService.tokenDecoded.primarygroupsid, [Validators.required]],
      horaDesde: [null, [Validators.required]],
      horaHasta: [null, [Validators.required]],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<HoraPicking>(DataApi.HoraPicking,
      "GetHoraPickingByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          //  console.log(JSON.stringify(record));
          } else {
            this.toastService.warning("Registro no encontrada");
            this.router.navigateByUrl('/mantenimientos/hora-picking');
          }
      }
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

 validarHora(event:any){
  let horaHasta=event.target.value.split(":",1)
  //Si la hora hasta seleccionada es igual 00 lo convertimos a 23:00
  if(horaHasta == "00")
     this.horaValida="23:00"
 }

 //validarHora($event)
  onSubmit() {
    this.submitted = true;
    if (this.Formulario.invalid) {
      return;

    }
    let h2=this.Formulario.get('horaHasta').value.includes('PM')? 12+Number(this.Formulario.get('horaHasta').value.split(":",2)[0] ): Number(this.Formulario.get('horaHasta').value.split(":",2)[0] );
    let h1=this.Formulario.get('horaDesde').value.includes('PM')? 12+Number(this.Formulario.get('horaDesde').value.split(":",2)[0] ): Number(this.Formulario.get('horaDesde').value.split(":",2)[0] );
    if( Number( h1 >= h2 ))
    {
      this.toastService.error("La Hora Final no puede ser menor a la hora Inicial.");
      return;
    }
    if(this.Formulario.get('horaHasta').value.includes('PM'))
    {

       this.horaHasta= 12+Number(this.Formulario.get('horaHasta').value.split(":",2)[0] )  + ":"  +this.Formulario.get('horaHasta').value.split(":",2)[1];
    }
    else
    {
      this.horaHasta= this.horaDesde=this.Formulario.get('horaHasta').value;
    }
    if(this.Formulario.get('horaDesde').value.includes('PM'))
    {

       this.horaDesde= 12+Number(this.Formulario.get('horaDesde').value.split(":",2)[0] )  + ":"  +this.Formulario.get('horaDesde').value.split(":",2)[1];
    }
    else{
      this.horaDesde=this.Formulario.get('horaDesde').value;
    }

    console.log(this.horaDesde)
    console.log(this.horaHasta)

    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
    this.guardar();
  }



  guardar() {
    let metodo: string = this.actualizando ? "Update" : "Registrar";

    this.btnGuardarCargando = true;
    let parametros = new HoraPicking();
      parametros.sucursalId =Number(this.Formulario.get('sucursalId').value);
      parametros.id =this.Formulario.get('id').value;
      parametros.diaId = Number(this.Formulario.get('diaId').value);
      parametros.companiaId = Number(this.authService.tokenDecoded.primarygroupsid);
      parametros.horaDesde =this.horaDesde;
      parametros.horaHasta =this.horaHasta;

    this.httpService.DoPostAny<any>(DataApi.HoraPicking,
      metodo, parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/hora-picking');
        }
        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getDias() {
    this.loadingDias = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetDiasDelaSemana", null).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.dias = response.records;
          //console.log(this.dias);
        }
        this.loadingDias = false;
      }, error => {
        this.loadingDias = false;
        this.toastService.error("No se pudo obtener los dias", "Error conexion al servidor");
        setTimeout(() => {
          this.getDias()
        }, 1000);

      });
  }



  getSucursal() {
    this.loadingSucursal = true;
    let parametros: Parametro[] = [
      { key: "CompaniaID", value: this.authService.tokenDecoded.primarygroupsid }
  ];

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSucursalesByCompaniaComboboxPicking",parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.Sucursal = response.records;

        }
        this.loadingSucursal = false;
      }, error => {
        this.loadingSucursal = false;
        this.toastService.error("No se pudo obtener las sucursales de Combo", "Error conexion al servidor");
        setTimeout(() => {
          this.getSucursal()
        }, 1000);

      });
  }




}
