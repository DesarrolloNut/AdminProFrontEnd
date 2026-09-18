import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadoERP, EstadoGeneral } from 'src/app/shared/enums/EstadoGeneral';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { DetalleTransferenciaInventarioRequest } from '../models/DetalleTransferenciaInventarioRequest';
import { LoteAlmacen } from '../models/LoteAlmacen';
import { ParametroArticuloParaIntercambioDeAlmacen } from '../models/ParametroArticuloParaIntercambioDeAlmacen';
import { SolicitudArticuloDetalle } from '../models/SolicitudArticuloDetalle';
import { TransferenciaInventario } from '../models/TransferenciaInventario';
@Component({
  selector: 'app-transferencia-formulario',
  templateUrl: './transferencia-formulario.component.html',
  styleUrls: ['./transferencia-formulario.component.scss']
})

export class TransferenciaFormularioComponent implements OnInit {
  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  sucursales: ComboBox[] = [];
  loadingSucursales = false;
  IdTransferenciaInventario: boolean;
  usuario: Usuario;
  loadingSolicitudCompraTipo: boolean;
  articulosDeTransferenciaInventario: TransferenciaInventario[];
  solicitudTransferenciaInventario: SolicitudArticuloDetalle[] = [new SolicitudArticuloDetalle()];
  loteAlmacen: LoteAlmacen [] = [new LoteAlmacen()];
  total: number;
  loadingArticulosDeTransferenciaInventario: boolean;
  loadingCotizacionDetalle: boolean;
  cantidadEditable= true;
  //Propiedades para almacenes
  almacenesDesde: ComboBox[];
  loadingAlmacenesDesde: boolean;
  almacenesHasta: ComboBox[];
  loadingAlmacenesHasta: boolean;
  almacenesDesdeSeleccionado: any;
  almacenesHastaSeleccionado: any;
  idAlamacenDesdeSeleccionado: any;
  idalmacenesHastaSeleccionado: number;
  defaultValueSelected: any;
  loadingSolicitudDetalle: boolean;
  Search: string = "";
  paginaSize: 5;
  paginaNumeroActual: 1;
  cantidadAtransferir: number;
  transferenciaInventarioConfirmado: boolean;
  cantidad: string = "Cantidad";
 //Propiedades del modal Lote almacen
  cantidadesDijitadoEnLoteDeAlmacen: number;
  hayErrores: boolean=true;
  loteAlmacenSeleccionado=  [];
  btnRecepcionCargando: boolean;
  searchProducto: any="";
  
  
  
  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private auth: AuthenticationService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    let id = Number(this.route.snapshot.paramMap.get('id'));
    this.CreateForm();
    if (id > 0) {
      this.getTransferenciaInventario(id)
      this.actualizando = true;

    } else {
      this.getUsuarioByID(Number(this.auth.tokenDecoded.nameid))

    }
    //Trayendo los almacenes
    this.getAlmacenesOrigenUsuarioEnrroll(0);
   // this.getArticulosParaIntercambioDeAlmacen();
    this.getSucursales()
  }
  private CreateForm() {

    this.Formulario = this.formBuilder.group({

      id: [0],
      usuarioId: [this.authService.tokenDecoded.nameid,[Validators.required]],
      sucursalId: [this.authService.tokenDecoded.groupsid, [Validators.required]],
      companiaId:[this.authService.tokenDecoded.primarygroupsid, [Validators.required]],
      almacenOrigenId:[null,[Validators.required]],
      almacenDestinoId:[null,[Validators.required]],
      fecha: [new Date()],
      estadoIdERP: [EstadoERP.PENDIENTESINCRONIZADO,],
      estado: [EstadoGeneral.PENDIENTE,],
      usuarioIdRecibe:[0 ,],
      fechaRecepcion:[ new Date(),],

    });
  }
 
  agregarDetalleVacio() {
    this.solicitudTransferenciaInventario.push(new SolicitudArticuloDetalle())
  }
  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  buscaMasProductos(event:any){
    this.searchProducto=event.target.value;
    this.getArticulosParaIntercambioDeAlmacen(Number(this.idAlamacenDesdeSeleccionado[0]));

 }

  getTransferenciaInventario(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<any>(DataApi.TransferenciaInventario,
      "GetTransferenciaInventarioByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            this.agregarDetalleVacio();
            let record = response.records[0]
            this.Formulario.patchValue(record);
            this.getAlmacenesOrigenUsuarioEnrroll(record.almacenOrigenId);
            this.getArticulosParaIntercambioDeAlmacen(record.almacenOrigenId);
            this.getTransferenciaDetalles(record.id,record.usuarioId);
            this.getLotesTransacciones(record.id)
            this.getUsuarioByID(record.usuarioId);
            this.idAlamacenDesdeSeleccionado=record.almacenOrigenId;
            this.idalmacenesHastaSeleccionado=record.almacenDestinoId;
            this.IdTransferenciaInventario=this.Formulario.get("id").value > 0 ? true: false;
            this.transferenciaInventarioConfirmado = this.Formulario.get("estado").value == EstadoGeneral.ENVIADO ? true: false;
            this.cantidad= this.Formulario.get("estado").value == 1 ? "Envio" : "Cantidad";
          } else {
            this.toastService.warning("no encontrado");
            this.router.navigateByUrl('/inventario/transferencia');
          }
        }
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getTransferenciaDetalles(id: number,usuarioId:number) {
    this.loadingSolicitudDetalle = true;
    let parametros = new DetalleTransferenciaInventarioRequest();
    parametros.companiaId =Number(this.authService.tokenDecoded.primarygroupsid),
    parametros.usuarioId=usuarioId, 
    parametros.id=id
    this.httpService.DoPostAny<SolicitudArticuloDetalle>(DataApi.TransferenciaInventario,
      "GetTransferenciaInventarioDetalles", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.solicitudTransferenciaInventario = response.records;   
        }
        this.loadingSolicitudDetalle = false;
      }, error => {
        this.loadingSolicitudDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }

  getLotesTransacciones(id: number) {
    
    this.httpService.DoPostAny<any>(DataApi.TransferenciaInventario,
      "GetLotesTransacciones", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.loteAlmacenSeleccionado = response.records;
        }
      }, error => {
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }
  
  onSelectArticulo(item: any, index: number) {
     if(!this.solicitudTransferenciaInventario.some(x => x.codigoReferencia == item.codigoReferencia))
     {
            this.solicitudTransferenciaInventario.forEach(x => {
            this.solicitudTransferenciaInventario[index].articuloId = item.articuloId;
            this.solicitudTransferenciaInventario[index].codigoReferencia = item.codigoReferencia;
            this.solicitudTransferenciaInventario[index].nombre = item.nombre;
            this.solicitudTransferenciaInventario[index].inventario = item.inventario;
            this.solicitudTransferenciaInventario[index].costo = item.costo;
            this.solicitudTransferenciaInventario[index].gestionado = item.gestionado;
          });
         this.articulosDeTransferenciaInventario[index].disabled=true;
     }
     else
     {
      this.toastService.warning("Este artículo ya existe en la lista.");

        this.onDeleteitem(index,0)
        return;
     }
  }

  calcularTotal() {
    this.total = 0
    this.solicitudTransferenciaInventario.forEach(x => {
      this.total += x.envio > 0 ? x.envio : 4
    })
  }
  isValid:boolean=false;
  validarInventario(event:any,inventario:any,index:number,idArticulo:number,content){
    this.cantidadAtransferir =  event.target.value;
    this.hayErrores=true;

    if(this.transferenciaInventarioConfirmado)
    {
      if(this.solicitudTransferenciaInventario[index].envio < this.cantidadAtransferir)
        {
          this.isValid=true;
        }
    }

    if((this.cantidadAtransferir <= inventario && this.cantidadAtransferir > 0) || (this.transferenciaInventarioConfirmado))
      {
         if(this.actualizando){
          //Agregando las propiedades de recepcion
            if(this.transferenciaInventarioConfirmado){
              this.solicitudTransferenciaInventario[index].usuarioIdRecibe=Number(this.authService.tokenDecoded.nameid);
              this.solicitudTransferenciaInventario[index].fechaRecepcion=new Date();
              this.solicitudTransferenciaInventario[index].solicitado=0;
            }
          
         this.loteAlmacen =this.loteAlmacenSeleccionado.filter(x=>x.articuloID==idArticulo);
          this.solicitudTransferenciaInventario[index].hayErrores = false;
          if(this.solicitudTransferenciaInventario[index].gestionado)
          {
            this.modalService.open(content, { size: 'lg', backdrop  : 'static',
            keyboard  : false });
          }
         }
         else{
          this.solicitudTransferenciaInventario[index].envio = Number(this.cantidadAtransferir) ;
          if(!this.solicitudTransferenciaInventario.find(x=>x.articuloId == idArticulo).lotesSeleccionado){
            this.GetLoteAlmacenPorArticulo(idArticulo);
          }
          else{
            this.loteAlmacen =this.loteAlmacenSeleccionado.filter(x=>x.articuloID==idArticulo);
          }
          this.solicitudTransferenciaInventario[index].hayErrores = false;
          if(this.solicitudTransferenciaInventario[index].gestionado)
          {
            this.modalService.open(content, { size: 'lg', backdrop  : 'static',
            keyboard  : false });
          }
          if(this.solicitudTransferenciaInventario.filter(x => x.articuloId <= 0).length < 1)
          {
            this.agregarDetalleVacio();
          }
         }

      }
      else
      {
        this.solicitudTransferenciaInventario[index].hayErrores = true;
        this.toastService.error("La cantidad no puede ser mayor al Inventario", "Error");
      }

  }
  agregarCantidadEnAlmacenLote(event:any,index:number,loteEnExistencia:number){
      let valorDigitado =event.target.value;
      if(!this.transferenciaInventarioConfirmado){
        if( valorDigitado >= 0 && loteEnExistencia > valorDigitado )
        {

          this.loteAlmacen[index].cantidadEnvio = Number(valorDigitado);
          this.loteAlmacen[index].moduloId = Number(DataApi.TransferenciaInventario);
          this.loteAlmacen[index].hayErrores = false;
          this.hayErrores=false;
        }
        else
        {
          this.loteAlmacen[index].hayErrores = true;
          this.hayErrores=true;
          this.toastService.error("La Cantidad a enviar no puede ser mayor a la cantidad en existencia.", "Error");
        }
      }
      else{
            if(valorDigitado >= 0 && loteEnExistencia > valorDigitado){

              this.loteAlmacen[index].recepcion = Number(valorDigitado);
              this.loteAlmacen[index].moduloId = Number(DataApi.TransferenciaInventario);
              this.loteAlmacen[index].hayErrores = false;
              this.hayErrores=false;
            }
            else
        {
          this.loteAlmacen[index].hayErrores = true;
          this.hayErrores=true;
          this.toastService.error("La Recepción no puede ser mayor a la cantidad en existencia.", "Error");
        }
      }
  }
  validarCantidadLoteAlmacenAtransferir(modal){
    let tot=0;

     tot= this.transferenciaInventarioConfirmado? this.loteAlmacen.reduce((n, {recepcion})=> n+recepcion,0):this.loteAlmacen.reduce((n, {cantidadEnvio})=> n+cantidadEnvio,0)

   if(tot > this.cantidadAtransferir || tot == 0 || tot < this.cantidadAtransferir){
      this.toastService.warning("El Total debe ser igual.")
      this.hayErrores=true;
    }
    else{
         this.modalService.dismissAll();
         this.loteAlmacen.forEach(x => {
         this.loteAlmacenSeleccionado.push(x);
         this.solicitudTransferenciaInventario.find(item=>item.articuloId==x.articuloID).lotesSeleccionado=true;
        })

        this.loteAlmacenSeleccionado = this.loteAlmacenSeleccionado.filter((item, index, self) => self.indexOf(item) === index);
      }
  }
  onDeleteitem(index: number, articuloId: number) {
    this.solicitudTransferenciaInventario.splice(index, 1);
    if(this.loteAlmacen.find(x=>x.articuloID ==articuloId))
       this.loteAlmacen=this.loteAlmacen.filter(x=>x.articuloID !==articuloId);

    if(this.loteAlmacenSeleccionado.find(x=>x.articuloID ==articuloId))
       this.loteAlmacenSeleccionado=this.loteAlmacenSeleccionado.filter(x=>x.articuloID !==articuloId);

    if (!this.solicitudTransferenciaInventario.some(x => x.articuloId <= 0)) {
      if(!this.actualizando)
        this.agregarDetalleVacio()
    }
  }
  getArticulosParaIntercambioDeAlmacen(almacenid:any) {

    let parametros: Parametro[] = [
      { key: "companiaid ", value: this.authService.tokenDecoded.primarygroupsid },
      { key: "almacenid", value: almacenid },
      { key: "search", value: this.searchProducto },
    ]


      this.httpService.DoPost<any>(DataApi.Articulo,
        "GetArticulosParaIntercambioDeAlmaces", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articulosDeTransferenciaInventario = response.records;
       
        }
        this.loadingArticulosDeTransferenciaInventario = false;
      }, error => {
        this.loadingArticulosDeTransferenciaInventario = false;
        this.toastService.error("No se pudo obtener los articulos", "Error conexion al servidor");
       

      });

     
  }


  getAlmacenDesde(event: any){
          const almacenId=(event.target as HTMLInputElement).value.split("|",1);
          this.idAlamacenDesdeSeleccionado=almacenId;
          const nombre=(event.target as HTMLInputElement).value.split("|",2);
          this.almacenesDesdeSeleccionado=nombre[1];
          this.getArticulosParaIntercambioDeAlmacen(Number(this.idAlamacenDesdeSeleccionado));
          this.getAlmacenesDestinUsuarioEnrroll(this.idAlamacenDesdeSeleccionado,0)
  }

  getAlmacenHasta(event: any){
    const almacenId=(event.target as HTMLInputElement).value.split("|",1);
    this.idalmacenesHastaSeleccionado=Number(almacenId);
    const nombre=(event.target as HTMLInputElement).value.split("|",2);
    this.almacenesHastaSeleccionado=nombre[1];
}

  onSubmit() {
    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
    if (!this.solicitudTransferenciaInventario.some(x => x.articuloId > 0)) {
      this.toastService.warning("Debes de tener al menos un artículo.")
      return;
    }
    if(!this.transferenciaInventarioConfirmado)
    {
    if (this.solicitudTransferenciaInventario.some(x => x.articuloId > 0 && x.envio <= 0)) {
      this.toastService.warning("La candidad no pueder ser menor o igual a zero.")
      return;
    }
  }
  if(this.transferenciaInventarioConfirmado)
    {
      if (this.solicitudTransferenciaInventario.some(x => x.articuloId > 0 && x.recepcion <= 0)) {
        this.toastService.warning("La Recepción  no pueder ser menor o igual a zerokkkkkkkkkkkkkkk.")
        return;
      }

    }
    if(this.loteAlmacenSeleccionado.reduce((n, {cantidadEnvio})=> n+cantidadEnvio,0) !== this.solicitudTransferenciaInventario.filter(x=>x.gestionado).reduce((n, {envio})=> n+envio,0))
    {
      this.toastService.error("El total de articulos a transferir no corresponse a la cantidad de lote a digitado.")
      return;
    }
    if(this.loteAlmacenSeleccionado.reduce((n, {recepcion})=> n+recepcion,0) !== this.solicitudTransferenciaInventario.filter(x=>x.gestionado).reduce((n, {recepcion})=> n+recepcion,0))
    {
      this.toastService.error("El total de articulos a recibir no corresponse a la cantidad de lote a digitado.")
      return;
    }

    if (this.idAlamacenDesdeSeleccionado == this.idalmacenesHastaSeleccionado) {
      this.toastService.warning("Los almacenes no pueden ser iguales.")
      return;
    }


    for (var i = 0; i < this.solicitudTransferenciaInventario.length; i++) {
      this.solicitudTransferenciaInventario[i] = Object.assign(this.solicitudTransferenciaInventario[i] , {
      id:this.Formulario.get("id").value,
      UsuarioId:Number(this.Formulario.get("usuarioId").value),
      CompaniaId:Number(this.Formulario.get("companiaId").value),
      SucursalId:Number(this.Formulario.get("sucursalId").value),
      Estado:this.transferenciaInventarioConfirmado ? EstadoGeneral.RECIBIDO: this.Formulario.get('estado').value,
      EstadoIdERP:this.Formulario.get("estadoIdERP").value,
      AlmacenDestinoId:this.Formulario.get("almacenDestinoId").value,
      AlmacenOrigenId: Number(this.idAlamacenDesdeSeleccionado),
      Fecha:this.Formulario.get("fecha").value,
    });

        delete this.solicitudTransferenciaInventario[i].codigoReferencia;
        delete this.solicitudTransferenciaInventario[i].nombre;
        delete this.solicitudTransferenciaInventario[i].enTransito;
        delete this.solicitudTransferenciaInventario[i].unidadMedida;
        delete this.solicitudTransferenciaInventario[i].almacenId;
        delete this.solicitudTransferenciaInventario[i].inventario;
        delete this.solicitudTransferenciaInventario[i].inventarioTipoId;
        delete this.solicitudTransferenciaInventario[i].companiaID;
   }
  this.solicitudTransferenciaInventario = this.solicitudTransferenciaInventario.filter(x => x.articuloId > 0 );
  if(this.actualizando){
    this.solicitudTransferenciaInventario.forEach(x=>{
      x.fechaRecepcion= new Date();
    })
  }
  if(this.transferenciaInventarioConfirmado){
    this.solicitudTransferenciaInventario.forEach(x=>{
      x.fechaRecepcion= new Date();
      x.estado=EstadoGeneral.CONFIRMADO
    })
  }

  this.guardar();
};



  guardar() {
    let estado=this.Formulario.get('estado').value
    if(this.transferenciaInventarioConfirmado){
       estado=EstadoGeneral.RECIBIDO;
    }
    if(this.transferenciaInventarioConfirmado && (this.solicitudTransferenciaInventario.reduce((n, {recepcion})=> n+recepcion,0) !== this.solicitudTransferenciaInventario.reduce((n, {envio})=> n+envio,0) )){
      estado=EstadoGeneral.CONFIRMARDIFERENCIA;
   }

    let encabezadoTransferenciaInventario  = {
       Id : Number(this.Formulario.get('id').value),
       AlmacenOrigenId : Number(this.idAlamacenDesdeSeleccionado),
       AlmacenDestinoId :Number(this.Formulario.get('almacenDestinoId').value),
       Fecha : this.Formulario.get('fecha').value,
       UsuarioId :Number(this.Formulario.get('usuarioId').value),
       Estado: estado,
       EstadoIdERP : this.Formulario.get('estadoIdERP').value,
       CompaniaId : Number(this.Formulario.get('companiaId').value),
       SucursalId : Number(this.Formulario.get('sucursalId').value),
       usuarioIdRecibe: this.transferenciaInventarioConfirmado ? Number(this.authService.tokenDecoded.nameid): 0,
       fechaRecepcion:this.transferenciaInventarioConfirmado ? new Date(): new Date(),
      };

     

    let parametro: any = {
      "TransferenciaInventario": encabezadoTransferenciaInventario,
      "TransferenciaInventarioDetalles": this.solicitudTransferenciaInventario.filter(x => x.articuloId > 0 && x.envio > 0),
      "LoteTransacciones": this.loteAlmacenSeleccionado.filter(x => x.cantidadEnvio > 0)
    }
  

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;
    this.httpService.DoPostAny<any>(DataApi.TransferenciaInventario,
      metodo, parametro).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.solicitudTransferenciaInventario=[new SolicitudArticuloDetalle()];
         
          this.router.navigateByUrl('/inventario/transferencia');
        }
        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  
  getUsuarioByID(usuarioID: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<any>(DataApi.Usuario,
      "GetUsuarioByID", usuarioID).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let usuario = response.records[0];
            delete usuario.passwordHash;
            delete usuario.passwordSalt;
            this.usuario = usuario;
          } else {
            this.toastService.warning("Usuario no encontrado");
            this.router.navigateByUrl('/inventario/transferencia');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getSucursales() {
    this.loadingSucursales = true;
    let parametros: Parametro[] = [
      {
        key: "CompaniaID",
        // value: this.authService.tokenDecoded.primarygroupsid
        value: 0
      }
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSucursalesByCompania", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sucursales = response.records;
        }
        this.loadingSucursales = false;
      }, error => {
        this.loadingSucursales = false;
        this.toastService.error("No se pudo obtener las sucursales.", "Error conexion al servidor");
        setTimeout(() => {
          this.getSucursales();
        }, 1000);
      });
  }

  getAlmacenesOrigenUsuarioEnrroll(id:number) {
    let parametros: Parametro[] = [
      { key: "almacenId", value: id },
      { key: "usuarioId", value: this.authService.tokenDecoded.nameid },
      { key: "CompaniaId", value: this.authService.tokenDecoded.primarygroupsid },
      { key: "Modulo", value: EstadosGeneralesKeyEnum.TRANSFERENCIA },
    ]
    this.loadingAlmacenesDesde = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetAlmacenesDestinUsuarioEnrroll", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almacenesDesde = response.records;
          this.almacenesDesdeSeleccionado= this.almacenesDesde.find(x=>x.codigo == this.idAlamacenDesdeSeleccionado).nombre;
          this.getAlmacenesDestinUsuarioEnrroll(this.idAlamacenDesdeSeleccionado,0)
        }
        this.loadingAlmacenesDesde = false;
      }, error => {
        this.loadingAlmacenesDesde = false;
        this.toastService.error("No se pudo obtener los almacenes", "Error conexion al servidor");

        setTimeout(() => {
          this.getAlmacenesOrigenUsuarioEnrroll(id);
        }, 1000);

      });
  }

  getAlmacenesDestinUsuarioEnrroll(almacenOrigenId:number,id:number) {

    let parametros: Parametro[] = [
      { key: "almacenId", value: this.actualizando ? Number(this.idalmacenesHastaSeleccionado):  Number(almacenOrigenId) },
      { key: "CompaniaId", value: Number(this.authService.tokenDecoded.primarygroupsid) },
      { key: "Tipo", value: this.actualizando? 1:0 },
    ]
    this.loadingAlmacenesDesde = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuarioAlmacenesDestinoModulo", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almacenesHasta = response.records;
        }
        this.loadingAlmacenesDesde = false;
      }, error => {
        this.loadingAlmacenesDesde = false;
        this.toastService.error("No se pudo obtener los almacenes", "Error conexion al servidor");

        setTimeout(() => {
          this.getAlmacenesDestinUsuarioEnrroll(almacenOrigenId,id);
        }, 1000);

      });
  }

  GetLoteAlmacenPorArticulo(articuloId: number) {
    this.Cargando = true;
    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      { key: "articuloId", value: articuloId},
      { key: "almacenId", value:Number(this.idAlamacenDesdeSeleccionado)},
    ]
    this.httpService.GetAllWithPagination<LoteAlmacen>(DataApi.TransferenciaInventario, "GetLoteAlmacenPorArticulo", "ID", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {
        if (x.ok) {
          this.loteAlmacen=x.records;

        } else {
          this.toastService.error(x.errores[0]);
          console.error(x.errores[0]);
        }
        this.Cargando = false;
      }, error => {
        console.error(error);
        this.toastService.error("Error conexion al servidor");
        this.Cargando = false;
      });

  }
  ConfirmarRecepcionTransferenciaInventario(id:number,recepcion:number,index:number){
    if(recepcion <= 0)
    {
      this.solicitudTransferenciaInventario[index].hayErrores = true;
      return;
    }
      let parametros =[
        { UsuarioIdRecibe: Number(this.authService.tokenDecoded.nameid) },
        { FechaRecepcion: new Date()},
        { Despachado: 10.5},
        { Estado: EstadoGeneral.RECIBIDO},
        { IdDetalleTransferenciaInventario:id},
        { Recepcion:recepcion},
      ];
      console.log(parametros);
      /*this.btnRecepcionCargando = true;
      this.httpService.DoPostAny<any>(DataApi.TransferenciaInventario,
        "RecepcionTransferenciaInventario", parametros).subscribe(response => {
          if (!response.ok) {
            this.toastService.error(response.errores[0], "Error");
          } else {
            this.toastService.success("Realizado", "OK");
          }
          this.btnRecepcionCargando = false;
        }, error => {
          this.btnRecepcionCargando = false;
          this.toastService.error("Error conexion al servidor.");
        });*/
  }
  validarRecepcion(event:any, index:number){
       let recepcion =event.target.value;
       if( recepcion > 0)
            this.solicitudTransferenciaInventario[index].hayErrores = false;
  }


}
