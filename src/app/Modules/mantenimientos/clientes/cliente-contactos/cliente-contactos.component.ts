import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';
import { ClienteContactos } from '../models/ClienteContactos';

@Component({
  selector: 'app-cliente-contactos',
  templateUrl: './cliente-contactos.component.html',
  styleUrls: ['./cliente-contactos.component.scss']
})
export class ClienteContactosComponent implements OnInit {
  @Input() clientId = 0;
  FormContactos: FormGroup;

  //BOOLEANOS
   cargando               = false;
   submitted              = false;
   btnGuardarCargando     = false;
   actualizando           = false;
   cargadoPuestos         = false;
  
  //LISTA 
   puestos             : ComboBox[];
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
   this.getPuestos();
  }


  onSubmit() {

    this.submitted = true;
    if (this.FormContactos.invalid)
      return;
  }


    private CreateForm() {

    this.FormContactos = this.formBuilder.group({
      clienteId: [this.clientId, [Validators.required, Validators.email]],
      contactos: new FormArray([])
    }
     );

  }

  get f() { return this.FormContactos.controls; }
  get c() { return this.f.contactos as FormArray; }



  onAddContact() : void{
    (this.f.contactos as FormArray).push(
      this.formBuilder.group({
        id:[0, Validators.required],
        nombres: [null, Validators.required],
        documento: [null, Validators.required, Validators.minLength(9)],
        documentoTipoID: [1, [Validators.required]], //cedula por defecto
        telefono: [null, Validators.required],
        celular: [null, Validators.required],
        email: [null, [Validators.required, Validators.email]],
        puesto: [0, [Validators.required]],
        
      } ,
      {
        validator: cedulaestructura('documento', 'documentoTipoID')
      },   
    ));
  }
 

  getPuestos() {
    this.cargadoPuestos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetPuestos", null).subscribe(response => {
  
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.puestos = response.records;
        }
        this.cargadoPuestos = false;
      }, error => {
        this.cargadoPuestos = false;
        this.toastService.error("No se pudo obtener los puestos", "Error conexion al servidor");
  
        setTimeout(() => {
          this.getPuestos()
        }, 1000);
  
      });
  }
  removeContact(index) {
    console.log(index);
    (this.f.contactos as FormArray).removeAt(index);
  }


  getContactFormControls(): AbstractControl[] {
    return (<FormArray> this.c).controls
  }

  send(values) {
    console.log(values);
  }
  
  
 
}
