import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ChequeDevuelto } from '../models/ChequeDevuelto';

@Component({
  selector: 'app-cheques-devueltos-formulario',
  templateUrl: './cheques-devueltos-formulario.component.html',
  styleUrls: ['./cheques-devueltos-formulario.component.scss']
})
export class ChequesDevueltosFormularioComponent implements OnInit {

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingClientes: boolean;
  clientes: ComboBox[];
  cliente: Cliente;

  bancos: ComboBox[];
  loadingBancos: boolean;
  loadingMotivos: boolean;
  motivos: ComboBox[];

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    let id = Number(this.route.snapshot.paramMap.get('id'));
    this.CreateForm();

    if (id > 0) {
      this.getItem(id);
      this.actualizando = true;
    }
    this.getClientes()
    this.getBancos()
    this.getChequeDevueltoMotivos()

  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      clienteId: [null, [Validators.required]],
      cheque: [null, Validators.required],
      monto: [null, Validators.required],
      fechaRegistro: [null],
      usuarioRegistroId: [null, [Validators.required]], 
      bancoID: [null, [Validators.required]],
      motivoID: [null, [Validators.required]],
    });
  }


  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<ChequeDevuelto>(DataApi.ChequeDevuelto,
      "GetChequeDevueltoByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
            this.getClientes(null, record.clienteId)
          } else {
            this.toastService.warning("ChequeDevuelto no encontrado");
            this.router.navigateByUrl('/finanzas/cuentas-por-cobrar/cheques-devueltos');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  onSubmit() {
    this.submitted = true;

    if (!this.actualizando) {
      this.f.usuarioRegistroId.setValue(Number(this.authService.tokenDecoded.nameid))
    }

    if (this.Formulario.invalid) {
      return;
    }

    this.guardar();
  }


  guardar() {

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    let formValue = this.getFormValue();

    this.httpService.DoPostAny<ChequeDevuelto>(DataApi.ChequeDevuelto,
      metodo, formValue).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/finanzas/cuentas-por-cobrar/cheques-devueltos');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getFormValue(): ChequeDevuelto {
    let formValue: ChequeDevuelto = this.Formulario.value;
    formValue.monto = Number(formValue.monto);
    return formValue;
  }



  getClientes(searchObj: any = null, clienteID: number = 0) {
    let search = ""

    if (searchObj)
      search = searchObj.term;

    this.loadingClientes = true;
    let parametros: Parametro[] = [
      { key: "CompaniaID", value: this.authService.tokenDecoded.primarygroupsid },
      { key: "Search", value: search },
      { key: "clienteID", value: clienteID },
    ];

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetClientesComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.clientes = response.records;
        }

        this.loadingClientes = false;
      }, error => {
        this.loadingClientes = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getClienteByID(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            this.cliente = response.records[0];
            // this.getArticulosPrecioActual()
          } else {
            this.toastService.warning("Cliente no encontrado");
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  onSelectCliente(cliente: ComboBox) {
    this.cliente = null
    if (cliente) {
      this.getClienteByID(cliente.codigo)
    }
  }




  getBancos() {
    this.loadingBancos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetBancos", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.bancos = response.records;
        }
        this.loadingBancos = false;
      }, error => {
        this.loadingBancos = false;
        this.toastService.error("No se pudo obtener los bancos", "Error conexion al servidor");

        setTimeout(() => {
          this.getBancos()
        }, 1000);

      });
  }


  getChequeDevueltoMotivos() {
    this.loadingMotivos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetChequeDevueltoMotivos", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.motivos = response.records;
        }
        this.loadingMotivos = false;
      }, error => {
        this.loadingMotivos = false;
        this.toastService.error("No se pudo obtener los motivos", "Error conexion al servidor");

        setTimeout(() => {
          this.getChequeDevueltoMotivos()
        }, 1000);

      });
  }



}
