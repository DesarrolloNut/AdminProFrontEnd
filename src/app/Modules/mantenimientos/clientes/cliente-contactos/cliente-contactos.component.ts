import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ComboBox } from 'src/app/shared/model/ComboBox';
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
   cargandoTiposRuta      = false;
   cargandoFVisitasCombo  = false;
   cargadoRutas           = false;
  
  //LISTA 
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
   
  }


  onSubmit() {

    this.submitted = true;
    if (this.FormContactos.invalid)
      return;
  }


    private CreateForm() {

    this.FormContactos = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      celular: [null, [Validators.required]],

      contactos: new FormArray([])
    }
     );

  }

  get f() { return this.FormContactos.controls; }
  get c() { return this.f.contactos as FormArray; }



  onAddContact() : void{
    (this.f.contactos as FormArray).push(
      this.formBuilder.group({
        telefono: [null, Validators.required],
        celular: [null, Validators.required],
        email: [null, [Validators.required, Validators.email]]
      })
    );
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
