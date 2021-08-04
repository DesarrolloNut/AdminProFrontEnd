import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Archivo, TipoAnexoEnum } from 'src/app/shared/model/Archivo';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ClienteFinanza } from '../models/ClienteFinanza';

@Component({
  selector: 'app-cliente-finanzas',
  templateUrl: './cliente-finanzas.component.html',
  styleUrls: ['./cliente-finanzas.component.scss']
})
export class ClienteFinanzasComponent implements OnInit {
  @Input() clientId = 0;
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
    TipoCondicionesPagos: ComboBox[];
    Plazos: ComboBox[];


 ///
 
 filesFromInput: any[] = [];
 filesSubidos: Archivo[] = [];


   //solicitud anexos
   cargandoAnexos: boolean
   anexosArchivosSubidas: Archivo[] = [];
   urlCarpetaArchivosAnexos: string;

   
  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
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
  }


  onSubmit() {
    this.submitted = true; 
  
    if (!this.actualizando)
      this.f.sucursalID.setValue(Number(this.auth.tokenDecoded.groupsid))
  
    if (this.FormFinanza.invalid)
      return;
  
   // this.guardarCliente();
  }

  private createForm() {

    this.FormFinanza = this.formBuilder.group({
      clienteId: [this.clientId],
      limiteCredito: [0, [Validators.required]],
      tipoCondicionPagoId: [2, [Validators.required]],
      plazoId: [0, [Validators.required]],
    },
    );
  }

  get f() { return this.FormFinanza.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html


  guardarOActualizarClienteFinanza(){
    this.btnGuardarCargando = true;
    this.httpService.DoPostAny<ClienteFinanza>(DataApi.ClienteContacto,
      'UpdateFinanzaCliente', this.FormFinanza.value).subscribe(response => {
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
getClienteFinanzaByID(id: number) {
  this.cargando = true;
  this.httpService.DoPostAny<ClienteFinanza>(DataApi.ClienteFinanza,
    "GetClienteFinanzaByID", id).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        //validar que existe
        if (response.records.length > 0) {
          let clientefinanza = response.records[0];
          console.log(clientefinanza)
          this.FormFinanza.setValue(clientefinanza);
        } else {
          this.toastService.warning("Información no encontrado");
          this.router.navigateByUrl('/mantenimientos/cliente');
        }
      }

    }, error => {
      this.cargando = false;
      this.toastService.error("Error conexion al servidor");
    });
}



  getTipoCondicionesPago() {
    this.loadingCondicionPagos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTipoCondicionPago", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.TipoCondicionesPagos = response.records;
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

  getPlazos() {
    this.loadingPlazos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetPlazos", null).subscribe(response => {

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

    const formData = new FormData();
    formData.append("clienteId", this.clientId + '');

    formData.append("tipoAnexo", TipoAnexoEnum.CLIENTE_FINANZA + '');

    for (let file of this.filesFromInput)
      formData.append("files", file);

    this.httpService.DoPostAny<any>(DataApi.UploadClienteAnexos,
      "UploadClienteAnexos", formData).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          // this.modalService.dismissAll()
          this.filesFromInput = []
          this.filesSubidos = []
          this.getArchivosSubidos()
          // this.router.navigateByUrl('/mantenimientos/almacen');
        }

        // this.btnGuardarCargando = false;
      }, error => {
        // this.btnGuardarCargando = false; 
        this.toastService.error("Error conexion al servidor");
      });


  }

  getArchivosSubidos() {
    this.cargandoAnexos = true;
    this.httpService.DoPostAny<Archivo>(DataApi.ClienteFinanza,
      "GetClienteFinanzaAnexosArchivos", this.FormFinanza.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.filesSubidos = response.records;
        }
        this.cargandoAnexos = false;

      }, error => {
        this.cargandoAnexos = false;
        console.error(error)
        this.toastService.error("Error conexion al servidor");
      });

  }


  ///METODOS UPLOAD
  setFiles(selectedfiles: any[]) {

    if (selectedfiles && selectedfiles.length > 0) {
      // this.filesFromInput = []
      for (let i = 0; i < selectedfiles.length; i++) {
        const element = selectedfiles[i];
        this.filesFromInput.push(element)
      }
    }
    // this.modalService.dismissAll();
  }

  onDeleteCotizacionSeleccionada(index: number) {
    this.filesFromInput.splice(index, 1);
    // console.log(this.filesFromInput)
  }
  
  onDeleteitem(index: number) {
    this.filesFromInput.splice(index, 1);
  }

}
