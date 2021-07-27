import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { SAPConnection } from '../models/sapconnection';
import { ServerTypes } from '../models/ServerType';

@Component({
  selector: 'app-sapconnection-formulario',
  templateUrl: './sapconnection-formulario.component.html',
  styleUrls: ['./sapconnection-formulario.component.scss']
})
export class SapconnectionFormularioComponent implements OnInit {


  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingSintomaCategorias: boolean;
  ServerTypeCategorias: any[];


  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    let id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      this.getItem(id);
      this.actualizando = true;
    }
    this.ServerTypeCategorias = this.ConvertEnumToArrayObject(ServerTypes);
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      server: [null, [Validators.required]],
      companyDB: [null, [Validators.required]],
      userDB: [null, [Validators.required]],
      passwordDB: [null, [Validators.required]],
      dbServerType: [0, [Validators.required]],
      inUse: [false, [Validators.required]],
      keyConnection:[null, Validators.required]
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<SAPConnection>(DataApi.SAPConnection,
      "GetSAPConnectionByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("SAPConnection no encontrado");
            this.router.navigateByUrl('/mantenimientos/sapconnection');
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

    this.httpService.DoPostAny<SAPConnection>(DataApi.SAPConnection,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/sapconnection');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  ConvertEnumToArrayObject(NameEnum) {
    const keyValue = [];

    const keys = Object.keys(NameEnum);
    let data =  keys.slice(keys.length / 2);


    for (const i in data) {
        const value = data[i];
        let codigonumber = Number(i) + 1;
        keyValue.push({codigo: codigonumber, nombre: value});
    }
    return keyValue;
}








}
