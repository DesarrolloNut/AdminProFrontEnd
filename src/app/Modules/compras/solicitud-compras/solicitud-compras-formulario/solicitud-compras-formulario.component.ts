import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { Proveedor } from 'src/app/Modules/mantenimientos/proveedores/models/Proveedor';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
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

  departamentos: ComboBox[];
  loadingDepartamentos: boolean;

  sucursales: ComboBox[] = [];
  loadingSucursales = false;

  loadingProveedores: boolean;
  proveedores: ComboBox[];

  fechaActual: Date;

  loadingCompradores: boolean;
  compradores: ComboBox[];

  usuario: Usuario;

  loadingSolicitudCompraTipo: boolean;
  solicitudCompraTipos: ComboBox[];

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private auth: AuthenticationService,
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

    this.getDepartamentos()
    this.getSucursales()
    this.getProveedores()
    this.getCompradores()
    this.getSolicitudCompraTipo()
    this.getHoraActual()
    this.getUsuarioByID(Number(this.auth.tokenDecoded.nameid))
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      codigoReferencia: [null,],
      departamentoID: [null, [Validators.required]],
      solicitanteID: [0, [Validators.required]],
      sucursalID: [null, [Validators.required]],
      estadoID: [0,],
      fechaSolicitud: [null,],
      compradorID: [null, [Validators.required]],
      fechaEntrega: [null,],
      anexoUrl: [null,],
      proveedorID: [null, [Validators.required]],
      tipoSolicitudID: [1, [Validators.required]],
      comentario: [null,],
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

    if (this.f.tipoSolicitudID.value == 2 && !this.f.comentario.value) {
      this.toastService.warning("Si la solicitud es urgente debes de llenar el campo comentario.")
      return;
    }



    // this.guardar();
  }


  guardar() {

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<Proveedor>(DataApi.SolicitudCompra,
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
            console.table(this.usuario)
          } else {
            this.toastService.warning("Usuario no encontrado");
            this.router.navigateByUrl('/compras/solicitud-compras');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getDepartamentos() {
    this.loadingDepartamentos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetDepartamentos", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.departamentos = response.records;
        }
        this.loadingDepartamentos = false;
      }, error => {
        this.loadingDepartamentos = false;
        this.toastService.error("No se pudo obtener los departamentos", "Error conexion al servidor");
        setTimeout(() => {
          this.getDepartamentos();
        }, 1000);
      });
  }

  getProveedores() {
    this.loadingProveedores = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetProveedores", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.proveedores = response.records;
        }
        this.loadingProveedores = false;
      }, error => {
        this.loadingProveedores = false;
        this.toastService.error("No se pudo obtener los Proveedores", "Error conexion al servidor");
        setTimeout(() => {
          this.getProveedores();
        }, 1000);
      });
  }

  getCompradores() {
    this.loadingCompradores = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetCompradores", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.compradores = response.records;
        }
        this.loadingCompradores = false;
      }, error => {
        this.loadingCompradores = false;
        this.toastService.error("No se pudo obtener los compradores", "Error conexion al servidor");
        setTimeout(() => {
          this.getCompradores();
        }, 1000);
      });
  }

  getSolicitudCompraTipo() {
    this.loadingSolicitudCompraTipo = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSolicitudCompraTipo", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.solicitudCompraTipos = response.records;
        }
        this.loadingSolicitudCompraTipo = false;
      }, error => {
        this.loadingSolicitudCompraTipo = false;
        this.toastService.error("No se pudo obtener los tipos de solicitudes", "Error conexion al servidor");
        setTimeout(() => {
          this.getSolicitudCompraTipo();
        }, 1000);
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

  getHoraActual() {
    this.Cargando = true;
    this.httpService.DoPost<ComboBox>(DataApi.Public,
      "GetHoraActual", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.fechaActual = new Date(response.valores[0]);
        }

        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }





}
