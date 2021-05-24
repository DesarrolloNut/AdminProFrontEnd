import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { Proveedor } from 'src/app/Modules/mantenimientos/proveedores/models/Proveedor';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';

@Component({
  selector: 'app-solicitud-compras-formulario',
  templateUrl: './solicitud-compras-formulario.component.html',
  styleUrls: ['./solicitud-compras-formulario.component.scss']
})
export class SolicitudComprasFormularioComponent implements OnInit {

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

  documentos: ComboBox[];
  loadingDocumentos = false;
  buscandoDocumento: boolean;

  loadingCondicionPagos: boolean;
  TipoCondicionPagos: ComboBox[];

  sectores: any[];
  loadingSectores: boolean;

  loadingCiudades: boolean;
  ciudades: ComboBox[];

  loadingProvincias: boolean;
  provincias: ComboBox[];

  loadingActividadesEconomicas: boolean;
  actividadesEconomicas: ComboBox[];

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    let id = Number(this.route.snapshot.paramMap.get('id'));
    this.CreateForm();

    if (id > 0) {
      this.getItem(id);
      this.actualizando = true;
    }
 
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      codigoReferencia: [null,],
      departamentoID: [0],
      solicitanteID: [0, [Validators.required]],
      sucursalID: [null, [Validators.required]],
      estadoID: [0,],
      fechaSolicitud: [null,],
      compradorID: [null, [Validators.required]],
      fechaEntrega: [null,],
      anexoUrl: [null,],
      comentario: [null,],
      proveedorID: [null, [Validators.required]],
    });
  }


  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Proveedor>(DataApi.SolicitudCompra,
      "GetSolicitudCompraByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("no encontrado");
            this.router.navigateByUrl('/compras/solicitud-compras');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  onSubmit() {
    console.table(this.Formulario.value)
    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
    this.guardar();
  }


  guardar() {

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<Proveedor>(DataApi.Proveedor,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/compras/solicitud-compras');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

 

  // getActividadEconomica() {
  //   this.loadingActividadesEconomicas = true;
  //   this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
  //     "GetActividadEconomica", null).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         this.actividadesEconomicas = response.records;
  //       }
  //       this.loadingActividadesEconomicas = false;
  //     }, error => {
  //       this.loadingActividadesEconomicas = false;
  //       this.toastService.error("No se pudo obtener las actividadesEconomicas", "Error conexion al servidor");

  //       setTimeout(() => {
  //         this.getActividadEconomica()
  //       }, 1000);

  //     });
  // }



}
