import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ClienteComercial, ClienteComercialResponse, ClienteNegociacion } from '../models/ClienteComercial';
import { ClienteContactos } from '../models/ClienteContactos';

@Component({
  selector: 'app-cliente-comercial',
  templateUrl: './cliente-comercial.component.html',
  styleUrls: ['./cliente-comercial.component.scss']
})
export class ClienteComercialComponent implements OnInit {
  
  @Input() clientId = 0;
  @Input() isnotNecesaryFieldsComplete = false;
  @Output() isnotNecesaryFieldsCompleteO = new EventEmitter<boolean>();
  @Output() goTabByKey = new EventEmitter<string>();

  FormComercial: FormGroup;

  //BOOLEANOS
  cargando               = false;
  submitted              = false;
  btnGuardarCargando     = false;
  actualizando           = false;
  cargandoListasPrecios   = false;
  cargandoDelete         = false;
  loadingArticulos       = false;
  loadingTipoNegociacion = false;


  //LISTA 
  listasPrecios          : ComboBox[];
  articulos              : ComboBox[]
  tiposNegociacion       : ComboBox[]
  clienteNegociaciones   : ClienteNegociacion[];
  clienteComercial       : ClienteComercial;


  //OTROS
  negociacionFormGroupToDelete:FormGroup;
  negociacionIndexToDelete  = 0;

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
   this.getListaPrecios();
   this.getTipoNegociaciones();
   this.getArticulos();

   if (this.clientId > 0) {
    this.GetNegociacionesByClienteID();
    this.actualizando = true;
  }
  

  }


  onSubmit() {
    this.submitted = true;
    if (this.FormComercial.invalid)
      return;
    this.guardarOActualizarClienteComercial();
  }


    private CreateForm() {
    this.FormComercial = this.formBuilder.group({
      clienteId: [this.clientId, [Validators.required]],
      listaPrecioId: [null, [Validators.required]],
      negociaciones: new FormArray([])
    }
     );

  }

  get f() { return this.FormComercial.controls; }
  get n() { return this.f.negociaciones as FormArray; }

  guardarOActualizarClienteComercial(){
     
      this.btnGuardarCargando = true;
      this. getNegociacionFormControls().forEach(x=>{
        x.get("monto").setValue(parseFloat( x.get("monto").value))

        if(x.get("negociacionClienteId").value>1){
          x.get("articuloId").setValue(0)
        }else{
          x.get("comentario").setValue(null)
        }

      });

      this.httpService.DoPostAny<ClienteComercial>(DataApi.ClienteComercial,
        'InsertOrUpdateClienteComercial', this.FormComercial.value).subscribe(response => {
          if (!response.ok) {
            this.toastService.error(response.errores[0], "Error");
            this.btnGuardarCargando = false;
          } else {
              if(response.valores?.length>0){
                let f:ClienteComercialResponse= response.valores[0];
                 if(f.countId>=0){
                  let v= f.clienteTabsValida.tabsValida.find(x=>x.keyName=='COMERCIAL')
                   this.isnotNecesaryFieldsComplete  =  v.ok;
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
  GetNegociacionesByClienteID() {
    this.cargando = true;
    this.httpService.DoPostAny<ClienteComercial>(DataApi.ClienteComercial,
      "GetClienteComercialByID", this.clientId).subscribe(response => {
      this.clienteComercial= response.records[0];
      delete this.clienteComercial.cantRegistrados;

      this.f.listaPrecioId.setValue(this.clienteComercial.listaPrecioId);
       if(this.clienteComercial.negociaciones.length>0){
        this.generateAndShowNegociacion();
       }else{
        this.initFormArray(); 
       }
       this.cargando = false;
      }, error => {
        this.cargando = false;
        this.toastService.error("No se pudo obtener la información de comercial", "Error conexion al servidor");

        // setTimeout(() => {
        //   this.getDias();
        // }, 1000);

      });
  }

  deleteNegociacionById() {
    this.cargandoDelete = true;
    this.negociacionFormGroupToDelete.get('cargando').setValue(true);
    let c = new ClienteNegociacion();
    c.id =this.negociacionFormGroupToDelete.get('id').value;
    this.httpService.DoPostAny<number>(DataApi.ClienteComercial,
      "DeleteNegociacion", c).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
        this.removeNegociacion(this.negociacionIndexToDelete);
          this.toastService.success("Realizado");
        }
        this.negociacionFormGroupToDelete.get('cargando').setValue(false);
      }, error => {
        console.error(error)
        this.negociacionFormGroupToDelete.get('cargando').setValue(false);
        this.toastService.error("No se pudo eliminar la negociacion", "Error conexion al servidor");
      });
  }

  initFormArray() {
 //   this.onAddNegociacion();
  }

  
  generateAndShowNegociacion(){
    this.clienteComercial.negociaciones.forEach(x=>{
       this.onAddNegociacion(x);
    });
  }

  onAddNegociacion(cNegocio?:ClienteNegociacion) : void{
    if(cNegocio==undefined || cNegocio==null){
      (this.f.negociaciones as FormArray).push(
        this.formBuilder.group({
        id:[0],
        articuloId: [0, Validators.required],
        negociacionClienteId: [null, Validators.required],
        monto: [null, Validators.required],
        comentario: [null],
        cargando: [false],
      } ,
     ))
    }else{
      (this.f.negociaciones as FormArray).push(
        this.formBuilder.group({
        id:[cNegocio.id],
        articuloId: [cNegocio.articuloId],
        negociacionClienteId: [cNegocio.negociacionClienteId, Validators.required],
        monto: [cNegocio.monto, Validators.required],
        comentario: [cNegocio.comentario],
        cargando: [false],
      } ,
       ))
    }

  }
 
  onChangeTipoNegociacion(combo: ComboBox){

  //   console.log("negociacion",negociacion)
  //  if(combo.codigo!==1){
  //     negociacion.get("articuloId").value(null);
  //     negociacion.get("articuloId").setValidators(null);
  //  }else{
  //   negociacion.get("articuloId").setValidators([Validators.required]);
  //  }
  }
  getListaPrecios() {
    let c = new ComboBox();
    c.codigo=this.clientId;
    this.cargandoListasPrecios = true;
    this.httpService.DoPostAny<ComboBox>(DataApi.ComboBox,
      "GetListaPreciosByTipoClienteComboBox", c).subscribe(response => {
  
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.listasPrecios = response.records;
        }
        this.cargandoListasPrecios = false;
      }, error => {
        console.log(error)
        this.cargandoListasPrecios = false;
        this.toastService.error("No se pudo obtener la lista de precios", "Error conexion al servidor");
  
        setTimeout(() => {
         // this.getListaPrecios()
        }, 1000);
  
      });
  }



  getTipoNegociaciones() {
    this.loadingTipoNegociacion = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTipoNegociacion", null).subscribe(response => {
  
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.tiposNegociacion = response.records;
        }
        this.loadingTipoNegociacion = false;
      }, error => {
        this.loadingTipoNegociacion = false;
        this.toastService.error("No se pudo obtener los tipos  de negociacion", "Error conexion al servidor");
  
        setTimeout(() => {
          this.getTipoNegociaciones()
        }, 1000);
  
      });
  }


  getArticulos(searchObj: any = null, articuloID: number = 0) {
    let search = ""

    if (searchObj)
      search = searchObj.term;

    this.loadingArticulos = true;
    let parametros: Parametro[] = [
      { key: "CompaniaID", value: this.auth.tokenDecoded.primarygroupsid },
      { key: "Search", value: search },
      { key: "articuloID", value: articuloID },
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetArticulos", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articulos = response.records;
        }

        this.loadingArticulos = false;
      }, error => {
        this.loadingArticulos = false;
        this.toastService.error("Obtener Articulos", "Error conexion al servidor");

        setTimeout(() => {
          this.getArticulos(searchObj, articuloID);
        }, 1000);

      });
  }

  removeNegociacion(index) {
    (this.f.negociaciones as FormArray).removeAt(index);
  }


  getNegociacionFormControls(): AbstractControl[] {
    return (<FormArray> this.n).controls
  }

  send(values) {
  }
  

  openModal(content, negociacion: FormGroup,index:any) {
    this.modalService.open(content, { size: 'sm',centered:true });
    this.negociacionFormGroupToDelete= negociacion;
    console.log(this.negociacionFormGroupToDelete.get('id').value)
    this.negociacionIndexToDelete = index;
    // this.articuloSeleccionado = item
  }

  onBtnModalOk() {
     if(this.negociacionFormGroupToDelete.get('id').value>0){
       this.deleteNegociacionById();
     }else{
       this.removeNegociacion(this.negociacionIndexToDelete);
     }
    this.modalService.dismissAll()
  }
  

}
