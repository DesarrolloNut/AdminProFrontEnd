import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Configuraciones } from 'src/app/shared/enums/Configuraciones';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Archivo, FilesUploaded, TipoAnexoEnum } from 'src/app/shared/model/Archivo';
import { ComboBox } from 'src/app/shared/model/ComboBox';

@Component({
  selector: 'app-cliente-negocio',
  templateUrl: './cliente-negocio.component.html',
  styleUrls: ['./cliente-negocio.component.scss']
})
export class ClienteNegocioComponent implements OnInit {
  @Input() clientId = 0;
  public state : TipoAnexoEnum;

  FormNegocio: FormGroup;

  //BOOLEANOS
  cargando              = false;
  btnGuardarCargando    = false;
  actualizando          = false;
  submitted             = false;
 
 ///
 
 filesFromInput: any[]           = [];
 filesSubidos:FilesUploaded[]    = [];
 documentosTipoAnexo:ComboBox[]  = [];


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
    private router: Router,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder,

    
    ) { }
    
    private createForm() {

      this.FormNegocio = this.formBuilder.group({
        clienteId: [this.clientId],
        tipoAnexo: [TipoAnexoEnum.CLIENTE_NEGOCIO],
      },
      );
    }

  ngOnInit() {
     this.createForm();
    if (this.clientId > 0) {
      this.getArchivosSubidos();
      this.actualizando = true;
    }

    this.getUrlCarpetaAnexosArchivos()
    this.getDocumentosTipoAnexo();
  }


  onSubmit() {
    this.submitted = true; 
    if (this.FormNegocio.invalid)
      return;
    this.subirArchivosAlServidor();
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
 

  
  getDocumentosTipoAnexo() {
     this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetDocumentoTipoAnexo", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.documentosTipoAnexo = response.records;
        }
       }, error => {
         this.toastService.error("No se pudo obtener los documentos tipo anexo", "Error conexion al servidor");

        setTimeout(() => {
          this.getDocumentosTipoAnexo()
        }, 1000);

      });
  }


  

  ///METODOS UPLOAD POST
  subirArchivosAlServidor() {
    if(this.filesFromInput.length<=0){
      this.toastService.error("Debe subir anexos");
      return;
  }
    this.btnGuardarCargando=true;
    let documentosTipoAnexoSelecteds:any[]=[];

    let filesUploaded:any =  this.filesFromInput.filter(function (x) {
      return x.uploaded==true
    });


     this.filesFromInput.forEach(f=>{
         documentosTipoAnexoSelecteds.push({
             documentoTipoAnexoId:f.documentoTipoAnexoId,
             fileName:f.name
          })
     });

    console.log(documentosTipoAnexoSelecteds)
    const formData = new FormData();
    formData.append("clienteId", this.clientId + '');

    formData.append("tipoAnexo", TipoAnexoEnum.CLIENTE_NEGOCIO + '');



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
          this.getArchivosSubidos()
          // this.router.navigateByUrl('/mantenimientos/almacen');
        }
        this.btnGuardarCargando=false;

      }, error => {
        this.btnGuardarCargando = false; 
        this.toastService.error("Error conexion al servidor");
      });


  }

  getArchivosSubidos() {
    this.cargandoAnexos = true;
    let parametros: Parametro[] = [
      { key: "clienteId", value: this.clientId},
      { key: "tipoAnexo", value: TipoAnexoEnum.CLIENTE_NEGOCIO},
     ]

     console.log(parametros)
    this.httpService.DoPostAny<FilesUploaded>(DataApi.ClienteNegocio,
      "GetClienteNegocioAnexosArchivos", this.FormNegocio.value).subscribe(response => {

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
      return  this.urlCarpetaArchivosAnexos + 'Cliente-Anexos/ClienteNegocio/ClienteNegocio'  + this.clientId +'/'
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
  
    console.log(item)
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
