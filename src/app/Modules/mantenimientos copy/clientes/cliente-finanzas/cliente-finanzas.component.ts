import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Configuraciones } from 'src/app/shared/enums/Configuraciones';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Archivo, DocumentosTipoAnexoSelected, FilesUploaded, TipoAnexoEnum } from 'src/app/shared/model/Archivo';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Cliente } from '../models/Cliente';
import { ClienteFinanza, ClienteFinanzaResponse } from '../models/ClienteFinanza';

@Component({
  selector: 'app-cliente-finanzas',
  templateUrl: './cliente-finanzas.component.html',
  styleUrls: ['./cliente-finanzas.component.scss']
})
export class ClienteFinanzasComponent implements OnInit {
  @Input() clientId = 0;
  @Input() clientExtraInfo = new Cliente();

  @Input() isnotNecesaryFieldsComplete = false;
  @Output()isnotNecesaryFieldsCompleteO = new EventEmitter<boolean>();
  @Output() goTabByKey = new EventEmitter<string>();

  FormFinanza: FormGroup;
  public state : TipoAnexoEnum;


  //BOOLEANOS
  cargando    = false;
  btnGuardarCargando    = false;
  actualizando          = false;
  submitted             = false;
  loadingCondicionPagos = false;
  loadingPlazos         = false;

  //LISTAS
    CondicionesPagos: ComboBox[];
    Plazos: ComboBox[];
    DocumentosTipoAnexo: ComboBox[];
 ///

 filesFromInput: any[] = [];
 filesSubidos: FilesUploaded[] = [];


   //solicitud anexos
   cargandoAnexos: boolean
   anexosArchivosSubidas: Archivo[] = [];
   urlCarpetaArchivosAnexos: string;


   loadingDeleteFile: boolean;

   imageFilselected = new FilesUploaded();

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
    private router: Router,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder,
    ) { }



  ngOnInit() {
    this.createForm();

    if (this.clientId > 0) {
      this.getClienteFinanzaByID(this.clientId);
      this.actualizando = true;
    }
    this.getTipoCondicionesPago();
    this.getPlazos();
    this.getUrlCarpetaAnexosArchivos()
    this.getDocumentosTipoAnexo();
  }


  onSubmit() {
    this.submitted = true;
    if (this.FormFinanza.invalid)
      return;
    this.guardarOActualizarClienteFinanza();
  }

  private createForm() {

    this.FormFinanza = this.formBuilder.group({
      clienteId: [this.clientId],
      usuarioId: [Number(this.auth.tokenDecoded.nameid)],
      limiteCredito: [0, [Validators.required]],
      clienteTipoId: [0],
      validarCreditoFactura:[1],
      condicionPagoId: [null, [Validators.required]],
      plazoId: [null, [Validators.required]],
    },
    );
  }

  get f() { return this.FormFinanza.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html


  guardarOActualizarClienteFinanza(){

    let valueBool = this.f.validarCreditoFactura.value ? 1 : 0;
    this.f.validarCreditoFactura.setValue(valueBool)

     if(this.f.condicionPagoId.value==1){
      //SI LA CONDICION DE PAGO ES CONTADO

      this.f.plazoId.setValue(0)

     }else if(this.f.condicionPagoId.value==2){
      //SI LA CONDICION DE PAGO ES CREDITO

      //SI EL CLIENTE TIPO ES DIFERENTE DE EMPLEADO
      if( this.f.clienteTipoId.value!=12 && this.f.clienteTipoId.value!=15){

        if(this.filesFromInput.length<=0){
          this.toastService.error("Debe subir anexos");
          return;
      }
      }
     }

    this.btnGuardarCargando = true;
    this.httpService.DoPostAny<ClienteFinanza>(DataApi.ClienteFinanza,
      'UpdateFinanzaCliente', this.FormFinanza.value).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
          this.btnGuardarCargando = false;
        } else {
          if(response.valores?.length>0){
            let f:ClienteFinanzaResponse= response.valores[0];
             if(f.id>0){
              let v= f.clienteTabsValida.tabsValida.find(x=>x.keyName=='FINANZAS')
               this.isnotNecesaryFieldsComplete  = v.ok;
               this.isnotNecesaryFieldsCompleteO.emit(v.ok);
               this.toastService.success("Realizado", "OK");
             }
          }
            if(this.f.condicionPagoId.value==2){
              this.subirArchivosAlServidor();
          }
        }
        this.btnGuardarCargando = false;

      }, error => {
        this.btnGuardarCargando = false;
        console.log(error)
        this.toastService.error("Error conexion al servidor");
      });
}
getClienteFinanzaByID(id: number) {
  (this.FormFinanza.get('tipoAnexo') as FormGroup)?.removeControl('tipoAnexo');

  this.cargando = true;
  this.httpService.DoPostAny<ClienteFinanza>(DataApi.ClienteFinanza,
    "GetClienteFinanzaByID", id).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        //validar que existe
        if (response.records.length > 0) {
          let clientefinanza = response.records[0];

           if(clientefinanza.condicionPagoId==-1){
            clientefinanza.condicionPagoId =1
           }
           this.FormFinanza.setValue(clientefinanza);
           this.getArchivosSubidos();

        } else {
          this.toastService.warning("Información no encontrado");
          this.router.navigateByUrl('/mantenimientos/cliente');
        }
      }
      this.cargando = false;

    }, error => {
      this.cargando = false;
      this.toastService.error("Error conexion al servidor");
    });
}

onSelectDocumentoTipoAnexo(item:any,docTipoAnexo:ComboBox){
 item.documentoTipoAnexoId = docTipoAnexo.codigo;
 item.documentoTipoAnexo = docTipoAnexo.nombre;
  }

getNameTipoAnexo(item:any):string{
  if(item.documentoTipoAnexo==null ||item.documentoTipoAnexo==""){
    return "Seleccione tipo anexo";
  }
  return item.documentoTipoAnexo;
}

  getTipoCondicionesPago() {
    this.loadingCondicionPagos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTipoCondicionPago", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
           this.CondicionesPagos = response.records;
        }
        this.loadingCondicionPagos = false;
      }, error => {
        this.loadingCondicionPagos = false;
        this.toastService.error("No se pudo obtener las condiciones de pago", "Error conexion al servidor");

        setTimeout(() => {
          this.getTipoCondicionesPago()
        }, 1000);

      });
  }


  getDocumentosTipoAnexo() {
     this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetDocumentoTipoAnexo", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.DocumentosTipoAnexo = response.records;
        }
       }, error => {
         this.toastService.error("No se pudo obtener las condiciones de pago", "Error conexion al servidor");

        setTimeout(() => {
          this.getDocumentosTipoAnexo()
        }, 1000);

      });
  }


  getPlazos() {
    this.loadingPlazos = true;
    let parametros: Parametro[] = [{ key: "clienteTipoId", value: this.clientExtraInfo.clienteTipoID }]

    this.httpService.DoPostAny<ComboBox>(DataApi.ComboBox,
      "GetPlazosComboBoxByTipoCliente", parametros[0]).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.Plazos = response.records;
        }
        this.loadingPlazos = false;
      }, error => {
        this.loadingPlazos = false;
        this.toastService.error("No se pudo obtener los plazos", "Error conexion al servidor");

        setTimeout(() => {
          this.getPlazos()
        }, 1000);

      });
  }

  ///METODOS UPLOAD POST
  subirArchivosAlServidor() {
    this.cargandoAnexos = true;
    this.btnGuardarCargando = true;

    let documentosTipoAnexoSelecteds:any[]=[];

    let filesUploaded:any =  this.filesFromInput.filter(function (x) {
      return   x.uploaded==true
    });


     this.filesFromInput.forEach(f=>{
         documentosTipoAnexoSelecteds.push({
             documentoTipoAnexoId:f.documentoTipoAnexoId,
             fileName:f.name
          })
     });


    const formData = new FormData();
    formData.append("clienteId", this.clientId + '');

    formData.append("tipoAnexo", TipoAnexoEnum.CLIENTE_FINANZA + '');



    for (let file of this.filesFromInput){
      formData.append("filesToUpload", file);
    }


   formData.append("FilesUploaded", JSON.stringify(filesUploaded));

   formData.append("DocumentosTipoAnexoSelecteds", JSON.stringify(documentosTipoAnexoSelecteds));



    this.httpService.DoPostAny<any>(DataApi.UploadClienteAnexos,
      "UploadClienteAnexos", formData).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          // this.modalService.dismissAll()
          this.filesFromInput = []
          this.filesSubidos = []
          this.toastService.success("Archivos subidos", "OK");
          this.getArchivosSubidos()
          // this.router.navigateByUrl('/mantenimientos/almacen');
        }

         this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });


  }

  getArchivosSubidos() {
    this.cargandoAnexos = true;
    this.FormFinanza.addControl('tipoAnexo', this.formBuilder.control(1));
    this.httpService.DoPostAny<FilesUploaded>(DataApi.ClienteFinanza,
      "GetClienteFinanzaAnexosArchivos", this.FormFinanza.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.filesFromInput = response.records;

        }
        this.cargandoAnexos = false;

      }, error => {
        this.cargandoAnexos = false;
        console.error(error)
        this.toastService.error("Error conexion al servidor");
      });

  }
  getUrlCarpetaAnexosArchivos() {
    this.httpService.DoPostAny<string>(DataApi.Configuracion,
      "GetConfiguracionValor", Number(Configuraciones.URL_ARCHIVOS_COMPARTIDOS_WEB_ADMIN)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.urlCarpetaArchivosAnexos = response.records[0];
        }
      }, error => {
        console.error(error)
        this.toastService.error("No se pudo obtener la url de los archivos", "Error conexion al servidor");
      });
  }


  ///METODOS UPLOAD
  setFiles(selectedfiles: any[]) {

    if (selectedfiles && selectedfiles.length > 0) {
      // this.filesFromInput = []
      for (let i = 0; i < selectedfiles.length; i++) {
        const reader = new FileReader();
        const element = selectedfiles[i];

        reader.onload = (e: any) => {
          element['url'] = e.target.result;
      //    console.log(e.target.result);
        };
        reader.readAsDataURL(selectedfiles[i]);
        element['uploaded'] = false;
        element['loading'] = false;
        element['DocumentoTipoAnexoId'] = 0;
        element['DocumentoTipoAnexo'] = null;
        this.filesFromInput.push(element)
        //this.filesSubidos.push(element);
      }
    }
    // this.modalService.dismissAll();
  }


  onDeleteitem(item:any,index: number) {
    this.filesFromInput.splice(index, 1);
    item.loading=false;
  }

  deleteFile(item:any, index:number){
      item.loading=true;
     if(item.uploaded){
        this.deleteClienteAnexoArchivoByID(item,index);
     }else{
       this.onDeleteitem(item,index);
     }
  }

  deleteClienteAnexoArchivoByID(item: any, index:number) {
    this.loadingDeleteFile = true;
    this.httpService.DoPostAny<string>(DataApi.UploadClienteAnexos,
      "DeleteClienteAnexosArchivoByID", item.id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          item.loading=false;
          this.onDeleteitem(item,index)
          this.toastService.success("Realizado");
          //this.getArchivosSubidos();
        }
        this.loadingDeleteFile = false;
      }, error => {
        console.error(error)
        this.loadingDeleteFile = false;
        this.toastService.error("No se pudo eliminar el archivo", "Error conexion al servidor");
      });
  }


  isImage(file:any) : boolean{
    let ex =this.getExtensionFile(file.name)
     if(ex=='pdf'){
       return false;
     }else if(ex=="jpg" || ex=="png" || ex=="tif" || ex=="bmp" ||ex=="jpeg" ||ex=="jfif"){
       return true;
     }
  }



  getExtensionFile(fileName):string{
    var a:string[] = fileName.split(".");
    if( a.length === 1 || ( a[0] === "" && a.length === 2 ) ) {
        return "";
    }
    return a.pop().toLowerCase();
  }


  truncateString(name:string):string{
    if (name.length > 18) {
      return name.substring(0, 18) + '...';
   }
   return name;
  }

  formatUrlFile(file:any):string{
    if(file.uploaded){
      return  this.urlCarpetaArchivosAnexos + 'Cliente-Anexos/ClienteFinanza/ClienteFinanza'  + this.clientId +'/'
      + file.name ;
    }else{
      return file.url ;
    }

  }
 goPdf(item:any){
  window.open(
     this.formatUrlFile(item),
    '_blank' // <- This is what makes it open in a new window.
  );
 }
  openModal(content,item:any) {

    this.imageFilselected.id = item.id;
    this.imageFilselected.name = item.name;
    this.imageFilselected.url = this.formatUrlFile(item);

    this.modalService.open(content, { size: 'lg',centered:true });
    // this.articuloSeleccionado = item
  }

  onBtnModalOk() {
    this.modalService.dismissAll()
  }
}
