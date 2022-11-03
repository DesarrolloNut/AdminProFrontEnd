import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';


import { ComboBox } from 'src/app/shared/model/ComboBox';
import { SolicitudDevolucion } from '../../solicitud-devolucion/models/SolicitudDevolucion';
import { ArticuloParaIntercambioRequest } from '../models/ArticuloParaIntercambioRequest';
import { ArticulosParaInterCambio } from '../models/ArticulosParaInterCambio';
import { LoteAlmacen } from '../models/LoteAlmacen';

import { SolicitudArticuloDetalle } from '../models/SolicitudArticuloDetalle';

@Component({
  selector: 'app-solicitud-cambio-formulario',
  templateUrl: './solicitud-cambio-formulario.component.html',
  styleUrls: ['./solicitud-cambio-formulario.component.scss']
})

export class SolicitudCambioFormularioComponent implements OnInit {
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
  articulosParaInterCambio: ArticulosParaInterCambio[];
  solicitudCambio: SolicitudArticuloDetalle[] = [new SolicitudArticuloDetalle()];
  encabezadoFactura: SolicitudDevolucion[]= [new SolicitudDevolucion()];
  loteAlmacen: LoteAlmacen [] = [new LoteAlmacen()];
  total: number;
  loadingArticulosDeTransferenciaInventario: boolean;
  loadingCotizacionDetalle: boolean;
  cantidadEditable= true;
  totalDelaFactura: number=0.00;
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
  codigoArticuloAnteriorSeleccionado: any;
  indexAnteriorSeleccionado: number;
  hayFactura: boolean;
  loadingClientes: boolean;
  nombreCliente:string="";
  documentoCliente:string="";
  listaPrecioId: any;
  clienteId: number;
 

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
     
      this.actualizando = true;

    } else {
      this.getUsuarioByID(Number(this.auth.tokenDecoded.nameid))
     
    }
    //Trayendo los almacenes
  
   // this.getArticulosParaIntercambioDeAlmacen();
    this.getSucursales()

  }
  private CreateForm() {

    this.Formulario = this.formBuilder.group({

      id: [0],
      usuarioId: [this.authService.tokenDecoded.nameid,[Validators.required]],
      sucursalId: [this.authService.tokenDecoded.groupsid, [Validators.required]],
      companiaId:[this.authService.tokenDecoded.primarygroupsid, [Validators.required]],
      codigoCliente:[null],   
      numeroFactura:[null],  
      secuenciaFactura:[null,],
      codigoreferenciaCliente: [null,[Validators.required]],
      ncf: [null,[Validators.required]],
      fechaCreacion:[null,[Validators.required]],
      cliente:[ null,[Validators.required]],
      totalNetoFactura:[ null,]

    });
  }

   seleccionarFactura(valor:any,index:number)
  {
    if ( valor.target.checked ) {
     this.solicitudCambio[index].destalleFacturaSelecionada=true;
   }
   else{

    this.solicitudCambio[index].destalleFacturaSelecionada=false;
    
  
   }
  }
  getFacturaByID(value) {
    const numFac=value.target.value;
    if(numFac ==="" || numFac == null ){
      this.toastService.warning("Digite un numero de factura.");
      return;
    }
    this.Formulario.reset();
    let chk=10004030;
    this.Cargando = true;
    let parametros = new SolicitudDevolucion();
    parametros.companiaId =Number(this.authService.tokenDecoded.primarygroupsid),
    parametros.numeroFactura=numFac, 
    this.httpService.DoPostAny<any>(DataApi.SolicitudCambio,
      "GetFacturaCambioByID", parametros).subscribe(x => {
        if (x.ok) {
          if(x.records.length >0)
          {
            this.Formulario.patchValue(x.records[0])
            this.encabezadoFactura=x.records;
            this.getDetalleFactura(numFac)
          }
          else{
            this.toastService.error(`No se pudo encontrar la factura: ${numFac} `);
          }
         
        } else {
          this.toastService.error(x.errores[0]);
          this.toastService.error(`No se pudo encontrar la factura: ${numFac} `);
        }
        this.Cargando = false;
      }, error => {
        this.toastService.error("Error conexion al servidor");
        this.Cargando = false;
      });
  }

  verificarSiHayFactura(event){
    if ( event.target.checked ) {
      this.hayFactura=true;
   
  }
  else {
    this.hayFactura=false;
    this.solicitudCambio = [new SolicitudArticuloDetalle()];
    this.nombreCliente="";
    this.documentoCliente="";
    this.totalDelaFactura=0.00;
    this.Formulario.reset();
    this.articulosParaInterCambio=[];
  }
  }

  getDetalleFactura(numeroFactura:string) {
 
    this.Cargando = true;
    let parametros = new SolicitudDevolucion();
    parametros.companiaId =Number(this.authService.tokenDecoded.primarygroupsid),
    parametros.numeroFactura=numeroFactura, 
    this.httpService.DoPostAny<any>(DataApi.SolicitudCambio,
      "GetDetalleFacturaCambio", parametros).subscribe(x => {
        if (x.ok) {
          if(x.records.length >0)
          {
            this.Formulario.patchValue(x.records[0])
            this.solicitudCambio=x.records
            console.log(this.solicitudCambio)
            this.calcularTotal();
           
          }
          else{
            this.toastService.error(`La factura ${numeroFactura} no tiene detalle`);
          }
         
        } else {
          this.toastService.error(x.errores[0]);
          this.toastService.error(`No se pudo encontrar detalle para la factura ${numeroFactura}`);
        }
        this.Cargando = false;
      }, error => {
        this.toastService.error("Error conexion al servidor");
        this.Cargando = false;
      });
  }
  
 
  calcularTotal(){
    this.totalDelaFactura=0.00;
    this.totalDelaFactura=0.00;
    for(let i=0; i<this.solicitudCambio.length; i++ ){
      let subTotal=(this.solicitudCambio[i].cantidad * this.solicitudCambio[i].precio)
      let descuento=   (subTotal*(this.solicitudCambio[i].porcientoDescuento/100))
      let impuesto= (subTotal -descuento)*(this.solicitudCambio[i].porcientoImpuesto/100)
      let totalNeto= (subTotal- descuento) +impuesto;
      this.totalDelaFactura= this.totalDelaFactura +totalNeto
    }
  }
  getCliente(value) {
  const codigoCliente=value.target.value;
  if(codigoCliente ==="" || codigoCliente == null ){
    this.toastService.warning("Digite un código cliente.");
    return;
  }
  let parametros = new Cliente();
  parametros.companiaId =Number(this.authService.tokenDecoded.primarygroupsid),
  parametros.codigoReferencia=codigoCliente, 

    this.httpService.DoPostAny<any>(DataApi.SolicitudCambio,
      "GetClienteParaSolicitudCambio", parametros).subscribe(response => {
        if (response.ok) {
          if(response.records.length >0)
          {
            this.documentoCliente=response.records[0].documento;
            this.nombreCliente=response.records[0].nombres;
            this.listaPrecioId=response.records[0].listaPrecioId;
            this.clienteId=response.records[0].id
            this.getArticulosParaIntercambio(17,this.listaPrecioId)  
            
          }
          else{
            this.toastService.error(`No se pudo encontrar el cliente con código : ${codigoCliente} `);
          }
         
        } else {
          this.toastService.error(response.errores[0]);
          this.toastService.error(`No se pudo encontrar el cliente con código : ${codigoCliente} `);
        }
      }, error => {
       
        this.toastService.error("No se pudo obtener los clientes ", "Error conexion al servidor");
      });
  }

  getArticulosParaIntercambio(almacenid:number,listaPrecioId:number ) {
    let parametros = new ArticuloParaIntercambioRequest();
    parametros.almacenid = almacenid;
    parametros.companiaid = Number(this.authService.tokenDecoded.primarygroupsid);
    parametros.listaPrecioId=listaPrecioId

      this.httpService.DoPostAny<any>(DataApi.SolicitudCambio,
        "GetArticulosParaIntercambio", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articulosParaInterCambio = response.records;
          
        }
        this.loadingArticulosDeTransferenciaInventario = false;
      }, error => {
        this.loadingArticulosDeTransferenciaInventario = false;
        this.toastService.error("No se pudo obtener los articulos", "Error conexion al servidor");
        setTimeout(() => {
          //this.getArticulosParaIntercambioDeAlmacen(almacenid);
        }, 1000);

      });
  }
 
  agregarDetalleVacio() {
    this.solicitudCambio.push(new SolicitudArticuloDetalle())
  }
  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
 
 
  onSelectArticulo(item: any, index: number) {
     if(!this.solicitudCambio.find(x => x.codigoReferencia == item.codigoReferencia))
     {      
           
            this.solicitudCambio[index].articuloId = item.articuloid;
            this.solicitudCambio[index].codigoReferencia = item.codigoReferencia;
            this.solicitudCambio[index].nombre = item.nombre;
            this.solicitudCambio[index].precio = item.precio;
            if(this.codigoArticuloAnteriorSeleccionado > 0)
            {
              this.articulosParaInterCambio.find(x=>x.articuloid == this.codigoArticuloAnteriorSeleccionado).disabled=false;
            }
            this.articulosParaInterCambio.find(x=>x.articuloid == item.articuloid).disabled=true;
            if(this.solicitudCambio.filter(x=>x.articuloId ==0).length ==0)
            {
              this.agregarDetalleVacio();
            }  
             

     }
     else
     {
      this.toastService.warning("Este artículo ya existe en la lista.");
      this.solicitudCambio[index].articuloId = 0;
      this.solicitudCambio[index].nombre = "";
      this.solicitudCambio[index].codigoReferencia = "";
      this.onDeleteitem(index,item.articuloId)
        return;
     }
    
  }
  
  obtenerValorAnterior(codigoArticulo: any, index: number){
   this.codigoArticuloAnteriorSeleccionado=codigoArticulo;
   this.indexAnteriorSeleccionado=index;
  }
  isValid:boolean=false;
  onDeleteitem(index: number, articuloId: number) {
    this.solicitudCambio.splice(index, 1);
    if(this.loteAlmacen.find(x=>x.articuloID ==articuloId))
       this.loteAlmacen=this.loteAlmacen.filter(x=>x.articuloID !==articuloId);

    if(this.loteAlmacenSeleccionado.find(x=>x.articuloID ==articuloId))
       this.loteAlmacenSeleccionado=this.loteAlmacenSeleccionado.filter(x=>x.articuloID !==articuloId);

    if (!this.solicitudCambio.some(x => x.articuloId <= 0)) {
      if(!this.actualizando)
        this.agregarDetalleVacio();
    }
  }

  actualizarTotal(value:any, index:number){
     
    if(this.solicitudCambio[index].cantidad > this.solicitudCambio[index].cantidadFijo && this.hayFactura)
      {
        this.toastService.error("Valor digitado no puede ser mayor a la cantidad facturado.");
        this.solicitudCambio[index].hayErrores=true;
        return;
      }
      else{
        this.solicitudCambio[index].hayErrores=false;
      }

  
      
      this.solicitudCambio[index].cantidad=Number(value.target.value);

      let subTotal=(this.solicitudCambio[index].cantidad * this.solicitudCambio[index].precio)
      let descuento=   (subTotal*(this.solicitudCambio[index].porcientoDescuento/100))
      let impuesto= (subTotal -descuento)*(this.solicitudCambio[index].porcientoImpuesto/100)
      let detalleTotalNeto= (subTotal- descuento) +impuesto;

      this.solicitudCambio[index].subtotal=subTotal;
      this.solicitudCambio[index].totalDescuento=descuento;
      this.solicitudCambio[index].totalImpuesto=impuesto;
      this.solicitudCambio[index].totalNeto=detalleTotalNeto;
      this.calcularTotal();

    
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
  onSubmit(){
    
    this.submitted = true;
    if (this.solicitudCambio.filter(x=>x.destalleFacturaSelecionada).length <= 0) {
      this.toastService.error("Debes selecccionar un registro.");
      return;
    }
    if(this.solicitudCambio.some(x=>x.hayErrores==true))
    {
      this.toastService.error("Algunas filas contienen errores.");
      return;
    }
 this.guardar();

  }

  guardar() {
    this.encabezadoFactura[0].companiaId=Number(this.authService.tokenDecoded.primarygroupsid);
    this.encabezadoFactura[0].usuarioId=Number(this.auth.tokenDecoded.nameid);
    this.encabezadoFactura[0].sucursalId=Number(this.authService.tokenDecoded.groupsid);
    this.encabezadoFactura[0].fechaDocumento=new Date();
    this.encabezadoFactura[0].estadoERPID=1;
    this.encabezadoFactura[0].clienteId=this.clienteId;
    this.encabezadoFactura[0].tasa=0;
    this.encabezadoFactura[0].fechaRegistro=new Date();
    this.encabezadoFactura[0].estadoId=0;
    this.encabezadoFactura[0].comentario="";
    this.encabezadoFactura[0].preFijo="";
    this.encabezadoFactura[0].subTotal=this.solicitudCambio.filter(x=>x.destalleFacturaSelecionada).reduce((n, {precio,cantidad})=> n+(precio*cantidad),0)
    this.encabezadoFactura[0].impuestoTotal=this.solicitudCambio.filter(x=>x.destalleFacturaSelecionada).reduce((n, {totalImpuesto})=> n+totalImpuesto,0);
    this.encabezadoFactura[0].descuentoTotal=this.solicitudCambio.filter(x=>x.destalleFacturaSelecionada).reduce((n, {totalDescuento})=> n+totalDescuento,0)
    this.encabezadoFactura[0].totalNeto=this.solicitudCambio.filter(x=>x.destalleFacturaSelecionada).reduce((n, {totalNeto})=> n+totalNeto,0)
    this.solicitudCambio.filter(x => x.articuloId > 0 )
    let parametro: any = {
      "SolicitudCambio": this.encabezadoFactura[0],
      "SolicitudCambioDetalle": this.hayFactura? this.solicitudCambio.filter(x => x.destalleFacturaSelecionada == true ):this.solicitudCambio,
    }
   let metodo: string = this.actualizando ? "Update" : "Registrar";
   this.btnGuardarCargando = true;
   this.httpService.DoPostAny<any>(DataApi.SolicitudCambio,
     metodo, parametro).subscribe(response => {
       if (!response.ok) {
         this.toastService.error(response.errores[0], "Error");
       } else {
         this.toastService.success("Realizado", "OK");
         this.router.navigateByUrl('/inventario/solicitud-cambio');
       }
       this.btnGuardarCargando = false;
     }, error => {
       this.btnGuardarCargando = false;
       this.toastService.error("Error conexion al servidor");
     });
 }



}
