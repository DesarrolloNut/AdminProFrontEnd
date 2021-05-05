import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ArticuloFactura } from '../models/ArticuloFactura';
import { NotaCreditoArticulos } from '../models/NotaCredito';

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
  tipoNotaCreditoCategorias: any[] = [{ codigo: 'S', nombre: 'Servicio' }, { codigo: 'A', nombre: 'Articulo' }];
  sinMovimientoInventarioCategorias: any[] = [{ codigo: 0, nombre: 'Afectar Inventario' }, { codigo: 1, nombre: 'No Afectar Inventario' }];
  CuentasMayor: any[];
  IsReadonly: boolean = true;
  cliente: any = { Codigo:'', Nombre:'', Direccion:'', Documento:'', Phone:''}
  CodigoClienteId: string = "";
  articuloList: FormArray;

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
      comentario: [null,],
    });

    this.FormularioArticulo = this.formBuilder.group({
      codigoReferencia: [null, [Validators.required]],
      comentario: [null,],
      articulos: new FormArray([])
    });

    // set Articulolist to the form control containing Articulos
    this.articuloList = this.FormularioArticulo.get('articulos') as FormArray;

  }

  get f() { return this.FormularioServicio.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
  get a() { return this.FormularioArticulo.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
  get c() { return this.a.articulos as FormArray; }

  onChangeBuscarFactura() {
    this.btnBuscarCargando = true;
    let CodigoClienteId = Number(this.CodigoClienteId);
    this.onRemoveArticulos();
    this.httpService.DoPostAny<ArticuloFactura>(DataApi.NotaCredito,
      "ListaArticuloPorFactura", CodigoClienteId).subscribe(response => {
        if (!response.ok) {
          this.btnBuscarCargando = false;
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0];
            this.cliente.Nombre = record.cardName;
            this.cliente.Codigo = record.cardCode;
            this.cliente.Direccion = record.address;
            this.cliente.Phone = record.phone1;

            this.onAddArticulos(response.records);
            //this.FormularioServicio.setValue(record);
            this.btnBuscarCargando = false;
          } else {
            this.toastService.warning("NotaCredito no encontrado");
            this.router.navigateByUrl('/ventas/notacredito');
          }
        }

      }, error => {
        this.btnBuscarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  onAddArticulos(contacts: Array<ArticuloFactura> = new Array<ArticuloFactura>()) {

    if (contacts.length > 0 && this.c.length == 0) {
      for (const item of contacts) {

        this.c.push(this.formBuilder.group({
          codigoCliente: [item.cardCode,],
          codigoArticulo: [item.itemCode,],
          nombreArticulo: [item.dscription,],
          cantidad: [item.quantity,],
          sinMovimientoInventario: [1,],
          selecionado: [false,],

        }));

      }

    }

  }


  onRemoveArticulos() {
    let art = this.FormularioArticulo.get('articulos') as FormArray;
    art.clear()
  }

  checkValue(values: any, index) {

    if (!values.currentTarget.checked) {
      this.getArticulosFormGroup(index).controls.cantidad.clearValidators();
      this.getArticulosFormGroup(index).controls.sinMovimientoInventario.clearValidators();
    } else {
      this.getArticulosFormGroup(index).controls.cantidad.setValidators([Validators.required]);
      this.getArticulosFormGroup(index).controls.sinMovimientoInventario.setValidators([Validators.required]);
      this.getArticulosFormGroup(index).controls.cantidad.updateValueAndValidity();
      this.getArticulosFormGroup(index).controls.sinMovimientoInventario.updateValueAndValidity();
    }
    //console.log(values.currentTarget.checked);
  }

  getArticulosFormGroup(index): FormGroup {
    this.articuloList = this.FormularioArticulo.get('articulos') as FormArray;
    const formGroup = this.articuloList.controls[index] as FormGroup;
    return formGroup;
  }


  onSubmit() {
    // this.submitted = true;
    if (this.TipoNotaCreditoId == 'S') {
      if (this.FormularioServicio.invalid) {
        return;
      } else {
        this.procesarServicio();
      }

    } else if (this.TipoNotaCreditoId == 'A') {
      if (this.FormularioArticulo.invalid) {
        return;
      } else {
        console.log(this.FormularioArticulo.value)
        this.procesarArticulos();
      }
    }



  }


  procesarServicio() {
    this.btnGuardarCargando = true;
    this.httpService.DoPostAny<any>(DataApi.NotaCredito,
      "CrearNotaCreditoManualServicio", this.FormularioServicio.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/ventas/notacredito');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  procesarArticulos() {

    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<NotaCreditoArticulos>(DataApi.NotaCredito,
      "CrearNotaCreditoManualArticulo", this.FormularioArticulo.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/ventas/notacredito');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }





}
