import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { NotaCredito } from '../models/NotaCredito';

@Component({
  selector: 'app-notacredito-formulario',
  templateUrl: './notacredito-formulario.component.html',
  styleUrls: ['./notacredito-formulario.component.scss']
})
export class NotacreditoFormularioComponent implements OnInit {

  Cargando: boolean = false;
  FormularioServicio: FormGroup;
  FormularioArticulo: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  btnBuscarCargando = false;
  actualizando = false;
  TipoNotaCreditoId: string = 'A';
  loadingNotaCreditoCategorias: boolean;
  tipoNotaCreditoCategorias: any[] = [{codigo: 'S', nombre: 'Servicio'}, {codigo: 'A', nombre: 'Articulo'}];
  sinMovimientoInventarioCategorias: any[] = [{codigo: 0, nombre: 'Afectar Inventario'}, {codigo: 1, nombre: 'No Afectar Inventario'}];
  CuentasMayor: any[];
  IsReadonly: boolean = true;
  CodigoClienteId: string = "";

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    let id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      //this.getItem(id);
      this.actualizando = true;
    }
    //this.getCuentaMayor();
    this.CreateForm();
  }


  private CreateForm() {

    this.FormularioServicio = this.formBuilder.group({
      codigoCliente: [null, [Validators.required]],
      codigoCuentaMayor: ['000', [Validators.required]],
      cantidad: [0, [Validators.required]],
      descripcion: ["Pronto Pago 2%", [Validators.required]],
      codigoReferenciaDeudor: [null, [Validators.required]],
      comentario: [null, ],
    });

    this.FormularioArticulo = this.formBuilder.group({
      codigoFactura: [null, [Validators.required]],
      comentario: [null,],
      articulos: new FormArray([])
    });


  }

  get f() { return this.FormularioServicio.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
  get a() { return this.FormularioArticulo.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  // getItem(id: number) {
  //   this.Cargando = true;
  //   this.httpService.DoPostAny<NotaCredito>(DataApi.NotaCredito,
  //     "GetNotaCreditoByID", id).subscribe(response => {
  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         //validar que existe
  //         if (response != null && response.records != null && response.records.length > 0) {
  //           let record = response.records[0]
  //           this.FormularioServicio.setValue(record);
  //         } else {
  //           this.toastService.warning("NotaCredito no encontrado");
  //           this.router.navigateByUrl('/mantenimientos/sintoma');
  //         }
  //       }

  //     }, error => {
  //       this.Cargando = false;
  //       this.toastService.error("Error conexion al servidor");
  //     });
  // }


  onChangeBuscarFactura(){
        this.btnBuscarCargando = true;
    this.httpService.DoPostAny<NotaCredito>(DataApi.NotaCredito,
      "ListaArticuloPorFactura", this.CodigoClienteId).subscribe(response => {
        if (!response.ok) {
          this.btnBuscarCargando = false;
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.FormularioServicio.setValue(record);
            this.btnBuscarCargando = false;
          } else {
            this.toastService.warning("NotaCredito no encontrado");
            this.router.navigateByUrl('/mantenimientos/notacredito');
          }
        }

      }, error => {
        this.btnBuscarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  onSubmit() {

    this.submitted = true;
    if (this.FormularioServicio.invalid) {
      return;
    }else{
      console.log(this.TipoNotaCreditoId);
      if(this.TipoNotaCreditoId == 'S'){
        this.procesarServicio();

      }else if(this.TipoNotaCreditoId == 'A'){
        this.procesarArticulos();
      }

    }

  }


  procesarServicio() {
    console.log('dentro');
    console.table(this.FormularioServicio.value);
    this.btnGuardarCargando = true;
    this.httpService.DoPostAny<any>(DataApi.NotaCredito,
      "CrearNotaCreditoManualServicio", this.FormularioServicio.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/notacredito');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  procesarArticulos() {

    //let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<NotaCredito>(DataApi.NotaCredito,
      "CrearNotaCreditoManualArticulo", this.FormularioServicio.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/notacredito');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getCuentaMayor() {
    this.loadingNotaCreditoCategorias = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetListaCuentas", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.CuentasMayor = response.records;
        }
        this.loadingNotaCreditoCategorias = false;
      }, error => {
        this.loadingNotaCreditoCategorias = false;
        this.toastService.error("No se pudo obtener las cuentas mayor", "Error conexion al servidor");

        setTimeout(() => {
          this.getCuentaMayor();
        }, 1000);

      });
  }


}
