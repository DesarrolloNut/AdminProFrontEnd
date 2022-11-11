import { AuthenticationService } from './../../../../core/authentication/service/authentication.service';
import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-articulo-formulario',
  templateUrl: './articulo-formulario.component.html',
  styleUrls: ['./articulo-formulario.component.scss']
})
export class ArticuloFormularioComponent implements OnInit {
  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

  companias: ComboBox[] = [];
  modelos: ComboBox[];

  loadingCompanias = false;
  loadingModelos: boolean;
  loadingMarcas: boolean;
  marcas: ComboBox[];
  loadingArticuloTipos: boolean;
  articuloTipos: ComboBox[];
  articuloCategorias: ComboBox[];
  loadingArticuloCategorias: boolean;
  loadingArticuloFamilias: boolean;
  articuloFamilias: ComboBox[];
  unidadesMedida: ComboBox[];
  loadingUnidadesMedida: boolean;
  loadingImpuestos: boolean;
  impuestos: ComboBox[];





  @ViewChild("imageUpload") private contentRef: TemplateRef<Object>;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  stepNumber=1;
  btnGuardarFotoCargando: boolean;
  transform: ImageTransform = {};
  scale = 1;

  imageDefault400x400='assets/images/image400x400.png'
  image404='assets/images/image404.png'


  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private modalService: NgbModal,
    private auth:AuthenticationService,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    let id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      this.getItem(id);
      this.actualizando = true;
    }

    this.getMarcas()
    this.getTipoArticulos()
    this.getArticuloFamilias()
    this.getArticuloCategorias()
    this.getUnidadMedidas()
    this.getImpuestos();
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      descripcion: [null,],
      codigoReferencia: [null],
      marcaID: [null,[Validators.required]],
      tipoArticuloID: [null, Validators.required],
      estado: [false,],
      categoriaID: [null, Validators.required],
      familiaID: [null, Validators.required],
      impuestoId: [null, Validators.required],
      precio: [0,],
      costo: [0,],
      costoObjetivo: [0],
      margenObjetivo: [0],
      articuloDeCompra: [false,],
      articuloDeVenta: [false,],
      articuloDeInventario: [false,],
      articuloDeReproceso:[false, ],
      articuloActivoFijo: [false,],

      unidadMedida:[''],
      unidadMedidaId:[null, Validators.required],

      codigoBarra:[''],

      peso:[0,[Validators.required]],
      ubicacion:[null,[Validators.required]],

      imagenUrl:[''],

      gestionado:[false, ],

      companiaID: [Number(this.auth.tokenDecoded.primarygroupsid)],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  async getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Articulo>(DataApi.Articulo,
      "GetArticuloByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            if (record.imagenUrl==null || record.imagenUrl=='') {
              this.Formulario.setValue(record);
            }else{
              this.testImageExecute(record.imagenUrl).then(ok=>{
                if(!ok){
                  record.imagenUrl=this.image404;
                }
                this.Formulario.setValue(record);

              })
            }


          } else {
            this.toastService.warning("Articulo no encontrado");
            this.router.navigateByUrl('/mantenimientos/articulo');
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

    this.httpService.DoPostAny<Articulo>(DataApi.Articulo,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/articulo');
        }

        this.btnGuardarCargando = false;
      }, error => {
        console.log(error)
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }





  getMarcas() {
    this.loadingMarcas = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetMarcas", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.marcas = response.records;
        }
        this.loadingMarcas = false;
      }, error => {
        this.loadingMarcas = false;
        this.toastService.error("No se pudo obtener las marcas", "Error conexion al servidor");

        setTimeout(() => {
          this.getMarcas()
        }, 1000);

      });
  }

  onSelectMarca(marcaID: number) {
    this.f.modeloID.setValue(null)
    this.getModelosByMarcaID(marcaID)
  }

  getModelosByMarcaID(marcaID: number) {
    let parametro: Parametro[] = [{ key: "marcaid", value: marcaID }]
    this.loadingModelos = true;

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetModelosByCompaniaID", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.modelos = response.records;
        }
        this.loadingModelos = false;
      }, error => {
        this.loadingModelos = false;
        this.toastService.error("No se pudo obtener los modelos", "Error conexion al servidor");

        setTimeout(() => {
          this.getModelosByMarcaID(marcaID)
        }, 1000);

      });
  }

  getTipoArticulos() {
    this.loadingArticuloTipos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTipoArticulo", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articuloTipos = response.records;
        }
        this.loadingArticuloTipos = false;
      }, error => {
        this.loadingArticuloTipos = false;
        this.toastService.error("No se pudo obtener las articulos tipos", "Error conexion al servidor");

        setTimeout(() => {
          this.getTipoArticulos()
        }, 1000);

      });
  }

  getArticuloFamilias() {

    let parametros: Parametro[] = [
      { key: "CompaniaId", value: this.auth.tokenDecoded.primarygroupsid },
    ]

    this.loadingArticuloFamilias = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetArticuloFamilias", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articuloFamilias = response.records;
        }
        this.loadingArticuloFamilias = false;
      }, error => {
        this.loadingArticuloFamilias = false;
        this.toastService.error("No se pudo obtener las articulo familias", "Error conexion al servidor");

        setTimeout(() => {
          this.getArticuloFamilias()
        }, 2000);

      });
  }


  getArticuloCategorias() {
    this.loadingArticuloCategorias = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetArticuloCategoriasComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articuloCategorias = response.records;
        }
        this.loadingArticuloCategorias = false;
      }, error => {
        this.loadingArticuloCategorias = false;
        this.toastService.error("No se pudo obtener las articulos categorias", "Error conexion al servidor");

        setTimeout(() => {
          this.getArticuloCategorias()
        }, 2000);

      });
  }



  getUnidadMedidas() {


    this.loadingUnidadesMedida = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUnidadesMedida", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.unidadesMedida = response.records;
        }
        this.loadingUnidadesMedida = false;
      }, error => {
        this.loadingUnidadesMedida  = false;
        this.toastService.error("No se pudo obtener las unidades de medida", "Error conexion al servidor");

        setTimeout(() => {
          this.getUnidadMedidas()
        }, 2000);

      });
  }



  getImpuestos() {

    let parametros: Parametro[] = [
      { key: "CompaniaId", value: this.auth.tokenDecoded.primarygroupsid },
    ]

    this.loadingImpuestos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetImpuestos", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.impuestos = response.records;
        }
        this.loadingImpuestos = false;
      }, error => {
        this.loadingImpuestos = false;
        this.toastService.error("No se pudo obtener los impuestos", "Error conexion al servidor");

        setTimeout(() => {
          this.getImpuestos()
        }, 2000);

      });
  }


//ALL IMAGE COMPONENT PENDING MOVE
  openModal(content) {
    this.modalService.open(content, {size:'lg'});
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    if( this.imageChangedEvent){
      this.stepNumber=2;
    }
  }
  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;

  }
  imageLoaded() {
      // show cropper
  }
  cropperReady() {
      // cropper ready
  }
  loadImageFailed() {
      // show message
  }

  re_uploadImage(inputFile){
    inputFile.value=''
    this.imageChangedEvent=null;
    this.stepNumber=1
  }

  nextToSavePrevImage(){
    this.stepNumber=3;
  }



 async savePrevImage(inputFile)  {
  this.btnGuardarFotoCargando = true;

    const formData = new FormData();
    formData.append("articuloId", this.f.id.value + '');



    await this.dataUrlToFile(this.croppedImage,`${this.f.codigoReferencia.value}.png`)
      .then(file=>{
      formData.append("files", file);
      })


    this.httpService.DoPostAny<any>(DataApi.Upload,
      "UploadArticuloAnexos", formData).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.f.imagenUrl.setValue(this.croppedImage)
          // this.modalService.dismissAll()
         // this.files = []
         // this.getArchivosSubidos()
          // this.router.navigateByUrl('/mantenimientos/almacen');
        }
        setTimeout(() => {
         this.btnGuardarFotoCargando = false;
         inputFile.value=''
         this.imageChangedEvent=null;
         this.stepNumber=1
         this.modalService.dismissAll();
        }, 1000);
      }, error => {
         this.btnGuardarFotoCargando = false;
        this.toastService.error("Error conexion al servidor");
      });


  }
   async  dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {

    const res: Response = await fetch(dataUrl);
    const blob: Blob = await res.blob();
    let file= new File([blob], fileName, { type: 'image/png' });
    return file;
}
zoomOut() {
  if (this.scale.toFixed(1)=='0.8') {
      return;
  }
  this.scale -= .1;
  this.transform = {
      ...this.transform,
      scale: this.scale
  };
}

zoomIn() {
  if (this.scale.toFixed(1)=='1.2') {
    return;
}
  this.scale += .1;
  this.transform = {
      ...this.transform,
      scale: this.scale
  };
}
 public getSantizeUrl(url : string) {
if(url!=null){
        return this.sanitizer.bypassSecurityTrustStyle('url(' +url + ')');
 }
  }


 testImage(url) {

    // Define the promise
    const imgPromise = new Promise(function imgPromise(onSuccess, onError) {

        // Create the image
        const imgElement = new Image();

        // When image is loaded, resolve the promise
        imgElement.addEventListener('load', function imgOnLoad() {
            onSuccess(this);
        });

        // When there's an error during load, reject the promise
        imgElement.addEventListener('error', function imgOnError() {
            onError();
        })

        // Assign URL
        imgElement.src = url;

    });

    return imgPromise;
}

testImageExecute(urlImage:string):Promise<boolean>{
 return this.testImage(urlImage).then(

    function onSuccess(img) {
       return true;
    },

    function onError() {
      return false;
    }

   );

}



}
