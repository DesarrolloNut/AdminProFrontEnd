import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { SolicitudDevolucion } from '../models/SolicitudDevolucion';
import { SolicitudDevolucionDetalle } from '../models/SolicitudDevolucionDetalle';

@Component({
  selector: 'app-solicitud-devolucion-formulario',
  templateUrl: './solicitud-devolucion-formulario.component.html',
  styleUrls: ['./solicitud-devolucion-formulario.component.scss']
})
export class SolicitudDevolucionFormularioComponent implements OnInit {
  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  usuario: Usuario;
  solicitudDevolucionDetalle: SolicitudDevolucionDetalle[];
  encabezadoFactura: SolicitudDevolucion[]= [new SolicitudDevolucion()];
  totalDelaFactura: number=0.00;
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
  }
  private CreateForm() {
    this.Formulario = this.formBuilder.group({
      id: [""],
      usuarioId: [this.auth.tokenDecoded.nameid,[Validators.required]],
      sucursalId: [this.authService.tokenDecoded.groupsid, [Validators.required]],
      companiaId:[this.authService.tokenDecoded.primarygroupsid, [Validators.required]], 
      numeroFactura:[null,[Validators.required]], 
      secuenciaFactura:[null,[Validators.required]], 
      codigoreferenciaCliente: [null,[Validators.required]],
      ncf: [null,[Validators.required]],
      fechaCreacion:[null,[Validators.required]],
      cliente:[ null,[Validators.required]],
      totalNetoFactura:[ null,]
    });
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
    this.httpService.DoPostAny<any>(DataApi.SolicitudDevolucion,
      "GetFacturaByID", parametros).subscribe(x => {
        if (x.ok) {
          if(x.records.length >0)
          {
            this.Formulario.patchValue(x.records[0])
            
            this.encabezadoFactura=x.records;
            console.log(this.encabezadoFactura)
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
  seleccionarFactura(valor:any,index:number)
  {
    if ( valor.target.checked ) {
     this.solicitudDevolucionDetalle[index].destalleFacturaSelecionada=true;
   }
   else{
    this.solicitudDevolucionDetalle[index].destalleFacturaSelecionada=false;
   }
  }

  getDetalleFactura(numeroFactura:string) {
 
    this.Cargando = true;
    let parametros = new SolicitudDevolucion();
    parametros.companiaId =Number(this.authService.tokenDecoded.primarygroupsid),
    parametros.numeroFactura=numeroFactura, 
    this.httpService.DoPostAny<any>(DataApi.SolicitudDevolucion,
      "GetDetalleFactura", parametros).subscribe(x => {
        if (x.ok) {
          if(x.records.length >0)
          {
            this.Formulario.patchValue(x.records[0])
            this.solicitudDevolucionDetalle=x.records
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
  actualizarTotal(value:any, id:any,index:number){

    if(this.solicitudDevolucionDetalle[index].destalleFacturaSelecionada)
    {
      this.solicitudDevolucionDetalle[index].cantidad=Number(value.target.value);

      let subTotal=(this.solicitudDevolucionDetalle[index].cantidad * this.solicitudDevolucionDetalle[index].precio)
      let descuento=   (subTotal*(this.solicitudDevolucionDetalle[index].porcientoDescuento/100))
      let impuesto= (subTotal -descuento)*(this.solicitudDevolucionDetalle[index].porcientoImpuesto/100)
      let detalleTotalNeto= (subTotal- descuento) +impuesto;

      this.solicitudDevolucionDetalle[index].totalDescuento=descuento;
      this.solicitudDevolucionDetalle[index].totalImpuesto=impuesto;
      this.solicitudDevolucionDetalle[index].totalNeto=detalleTotalNeto;
  
      this.calcularTotal();

    }

    
  }

  calcularTotal(){
    this.totalDelaFactura=0.00;
    this.totalDelaFactura=0.00;
    for(let i=0; i<this.solicitudDevolucionDetalle.length; i++ ){
      let subTotal=(this.solicitudDevolucionDetalle[i].cantidad * this.solicitudDevolucionDetalle[i].precio)
      let descuento=   (subTotal*(this.solicitudDevolucionDetalle[i].porcientoDescuento/100))
      let impuesto= (subTotal -descuento)*(this.solicitudDevolucionDetalle[i].porcientoImpuesto/100)
      let totalNeto= (subTotal- descuento) +impuesto;
      this.totalDelaFactura= this.totalDelaFactura +totalNeto
    }
  }
  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
  
  onSubmit() {
    this.submitted = true;
    if (this.solicitudDevolucionDetalle.filter(x=>x.destalleFacturaSelecionada).length <= 0) {
      this.toastService.warning("Debes selecccionar un registro.");
      return;
    }

    
 this.guardar();
};

  guardar() {
     this.encabezadoFactura[0].companiaId=Number(this.authService.tokenDecoded.primarygroupsid);
     this.encabezadoFactura[0].usuarioId=Number(this.auth.tokenDecoded.nameid);
     this.encabezadoFactura[0].sucursalId=Number(this.authService.tokenDecoded.groupsid);
     this.encabezadoFactura[0].fechaDocumento=new Date();
     this.encabezadoFactura[0].estadoERPID=1;
     this.encabezadoFactura[0].tasa=0;
     this.encabezadoFactura[0].fechaRegistro=new Date();
     this.encabezadoFactura[0].estadoId=0;
     this.encabezadoFactura[0].comentario="";
     this.encabezadoFactura[0].preFijo="";
     this.encabezadoFactura[0].impuestoTotal=this.solicitudDevolucionDetalle.filter(x=>x.destalleFacturaSelecionada).reduce((n, {totalImpuesto})=> n+totalImpuesto,0);
     this.encabezadoFactura[0].descuentoTotal=this.solicitudDevolucionDetalle.filter(x=>x.destalleFacturaSelecionada).reduce((n, {totalDescuento})=> n+totalDescuento,0)
     this.encabezadoFactura[0].totalNeto=this.solicitudDevolucionDetalle.filter(x=>x.destalleFacturaSelecionada).reduce((n, {totalNeto})=> n+totalNeto,0)
    let parametro: any = {
      "SolicitudDevolucion": this.encabezadoFactura[0],
      "SolicitudDevolucionDetalle": this.solicitudDevolucionDetalle.filter(x => x.destalleFacturaSelecionada == true )
    }

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;
    this.httpService.DoPostAny<any>(DataApi.SolicitudDevolucion,
      metodo, parametro).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          
          this.router.navigateByUrl('/inventario/solicitud-devolucion');
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
}
