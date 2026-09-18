import { ThrowStmt } from '@angular/compiler';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';
import { Cliente, ValidaExisteClienteViewModel } from '../models/Cliente';
import { ClienteContactos, ClienteContactosRequest, ContactosResponse } from '../models/ClienteContactos';
import { FrecuenciaVisita } from '../models/FrecuenciaVisita';

@Component({
  selector: 'app-cliente-contactos',
  templateUrl: './cliente-contactos.component.html',
  styleUrls: ['./cliente-contactos.component.scss']
})
export class ClienteContactosComponent implements OnInit {
  @Input() clientId = 0;
  @Input() isnotNecesaryFieldsComplete = false;
  @Output()isnotNecesaryFieldsCompleteO = new EventEmitter<boolean>();
  @Output() goTabByKey = new EventEmitter<string>();

  FormContactos: FormGroup;

  //BOOLEANOS
   cargando               = false;
   submitted              = false;
   btnGuardarCargando     = false;
   actualizando           = false;
   cargadoPuestos         = false;
   cargandoDelete         = false;
   buscandoDocumento      = false;
  //LISTA
   puestos                : ComboBox[];
   clienteContactos       : ClienteContactos[];


  //OTROS
   contactoFormGroupToDelete:FormGroup;
   contactoIndexToDelete  = 0;

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private modalService: NgbModal,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder
    ) { }

  ngOnInit() {
   this.CreateForm();
   this.getPuestos();
   if (this.clientId > 0) {
    //this.GetContactosByClienteID();
    this.actualizando = true;
  }


  }


  onSubmit() {
    this.submitted = true;
    if (this.FormContactos.invalid)
      return;
    this.guardarOActualizarClienteContacto();
  }


    private CreateForm() {

    this.FormContactos = this.formBuilder.group({
      clienteId: [this.clientId, [Validators.required]],
      usuarioId: [Number(this.auth.tokenDecoded.nameid)],
      companiaId: [Number(this.auth.tokenDecoded.primarygroupsid)],
      contactos: new FormArray([])
    }
     );

  }
 
  get f() { return this.FormContactos.controls; }
  get c() { return this.f.contactos as FormArray; }

  guardarOActualizarClienteContacto(){
      this.f.clienteId.setValue(this.clientId);
      this.btnGuardarCargando = true;

      this.httpService.DoPostAny<ClienteContactos>(DataApi.ClienteContacto,
        'InsertarOActualizarClienteContacto', this.FormContactos.value).subscribe(response => {
          if (!response.ok) {
            this.toastService.error(response.errores[0], "Error");
            this.btnGuardarCargando = false;
          } else {
            if(response.valores?.length>0){
              let f:ContactosResponse= response.valores[0];
               if(f.id>0){
                let v= f.clienteTabsValida.tabsValida.find(x=>x.keyName=='CONTACTOS')
                 this.isnotNecesaryFieldsComplete= v.ok;
                 this.isnotNecesaryFieldsCompleteO.emit(v.ok);
                 this.toastService.success("Realizado", "OK");
                 this.router.navigateByUrl('/mantenimientos/cliente');
               }
            }
          }
          this.btnGuardarCargando = false;

        }, error => {
          this.btnGuardarCargando = false;
          this.toastService.error("Error conexion al servidor");
        });
  }
  GetContactosByClienteID() {
    this.cargando = true;
    this.httpService.DoPostAny<ClienteContactos>(DataApi.ClienteContacto,
      "GetContactosByClienteID", this.FormContactos.value).subscribe(response => {
       this.clienteContactos= response.records;
       if(this.clienteContactos.length>0){
        this.generateAndShowContact();
       }else{
        this.initFormArray();
       }
       this.cargando = false;
      }, error => {
        this.cargando = false;
        this.toastService.error("No se pudo obtener los contactos", "Error conexion al servidor");

        // setTimeout(() => {
        //   this.getDias();
        // }, 1000);

      });
  }

  deleteContactoById() {
    this.cargandoDelete = true;
    this.contactoFormGroupToDelete.get('cargando').setValue(true);
    let c = new ClienteContactos();
    c.id =this.contactoFormGroupToDelete.get('id').value;
    this.httpService.DoPostAny<number>(DataApi.ClienteContacto,
      "DeleteContacto", c).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
        this.removeContact(this.contactoIndexToDelete);
          this.toastService.success("Realizado");
        }
        this.contactoFormGroupToDelete.get('cargando').setValue(false);
      }, error => {
        console.error(error)
        this.contactoFormGroupToDelete.get('cargando').setValue(false);
        this.toastService.error("No se pudo eliminar el contacto", "Error conexion al servidor");
      });
  }

  initFormArray() {
    this.onAddContact();
  }


  generateAndShowContact(){
    this.clienteContactos.forEach(x=>{
       this.onAddContact(x);
    });
  }

  onAddContact(cContacto?:ClienteContactos) : void{
    if(cContacto==undefined || cContacto==null){
      (this.f.contactos as FormArray).push(
        this.formBuilder.group({
        id:[0],
        nombres: [null, Validators.required],
        documento: [null, [Validators.required, Validators.minLength(9)]],
        documentoTipoID: [1, Validators.required],
        telefono: [null, Validators.required],
        celular: [null, Validators.required],
        email: [null, [Validators.required, Validators.email]],
        puestoId: [0, Validators.required],
        cargando: [false],
      } ,
      {
         validator: cedulaestructura('documento', 'documentoTipoID')
      },))
    }else{
      (this.f.contactos as FormArray).push(
        this.formBuilder.group({
        id:[cContacto.id],
        nombres: [cContacto.nombres, Validators.required],
        documento: [cContacto.documento, [Validators.required, Validators.minLength(9)]],
        documentoTipoID: [cContacto.documentoTipoID, Validators.required],
        telefono: [cContacto.telefono, Validators.required],
        celular: [cContacto.celular, Validators.required],
        email: [cContacto.email, [Validators.required, Validators.email]],
        puestoId: [cContacto.puestoId, Validators.required],
        cargando: [false],
      } ,
      {
         validator: cedulaestructura('documento', 'documentoTipoID')
      },))
    }

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
    (this.f.contactos as FormArray).removeAt(index);
  }


  getContactFormControls(): AbstractControl[] {
    return (<FormArray> this.c).controls
  }

  send(values) {
    //console.log(values);
  }
  buscarCliente(documento: string) {
    this.buscandoDocumento = true;

    let parametros = new ParametrosCita();
    parametros.clienteDocumento = documento;

    this.httpService.DoPostAny<ValidaExisteClienteViewModel>(DataApi.Cliente,
      "GetClienteOPadronDatos", parametros).subscribe(response => {

        if (response.ok) {
          if (response != null && response.ok && response.records != null && response.records.length > 0) {
            let cliente = response.records[0];

            this.f.nombres.setValue(cliente.nombres);
            this.f.apellidos.setValue(cliente.apellidos);
            // this.f.celular.setValue(cliente.celular);

          } else {
            this.toastService.warning("Datos no encontrados");
            // this.f.nombres.setValue(null);
            // this.f.apellidos.setValue(null);
            // this.f.celular.setValue(null);
          }

        } else {
          this.toastService.error(response.errores[0]);
        }

        this.buscandoDocumento = false;
      }, error => {
        this.buscandoDocumento = false;
        this.toastService.error("Error conexion al servidor");
      });

  }
  //METODOS LOGIC
onDocumentoKeyUp(contact: FormGroup) {
  // this.f.celular.setValue(null);
  if (contact.get('documento').valid) {
    this.buscarClienteByRncOCedula(contact.get('documento').value,1,contact);
  }
}
  buscarClienteByRncOCedula(documento: string,documentoTipoID:number,contact: FormGroup) {
    this.buscandoDocumento = true;

    let parametros = new ParametrosCita();
    parametros.clienteDocumento = documento;
    parametros.documentoTipoID = documentoTipoID;

    this.httpService.DoPostAny<ValidaExisteClienteViewModel>(DataApi.Cliente,
      "GetClienteByCedulaOrRnc", parametros).subscribe(response => {

        if (response.ok) {
          if (response != null && response.ok && response.valores != null && response.valores.length > 0) {
            let cliente = response.valores[0];
            contact.get('nombres').setValue(cliente.nombres +' '+ cliente.apellidos);
            // this.f.celular.setValue(cliente.celular);
          } else {
            this.toastService.warning("Datos no encontrados");
           // this.f.nombres.setValue(null);
            // this.f.celular.setValue(null);
          }
        } else {
          this.toastService.error(response.errores[0]);
        }
        this.buscandoDocumento = false;
      }, error => {
        this.buscandoDocumento = false;
        this.toastService.error("Error conexion al servidor");
      });

  }

  openModal(content, contact: FormGroup,index:any) {
    this.modalService.open(content, { size: 'sm',centered:true });
    this.contactoFormGroupToDelete= contact;
   // console.log(this.contactoFormGroupToDelete.get('id').value)
    this.contactoIndexToDelete = index;
    // this.articuloSeleccionado = item
  }

  onBtnModalOk() {
     if(this.contactoFormGroupToDelete.get('id').value>0){
       this.deleteContactoById();
     }else{
       this.removeContact(this.contactoIndexToDelete);
     }
    this.modalService.dismissAll()
  }


}
