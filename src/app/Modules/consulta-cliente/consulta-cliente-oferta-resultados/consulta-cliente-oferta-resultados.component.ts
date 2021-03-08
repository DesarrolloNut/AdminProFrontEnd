import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';

@Component({
  selector: 'app-consulta-cliente-oferta-resultados',
  templateUrl: './consulta-cliente-oferta-resultados.component.html',
  styleUrls: ['./consulta-cliente-oferta-resultados.component.scss']
})
export class ConsultaClienteOfertaResultadosComponent implements OnInit {
  Cargando: boolean;
  factura: string;
  notaCredito: string;
  cliente: string;
  cedula: string;
  fechaRegistro: string;
  fechaValidoHasta: string;
  montoPromocion: number;
  resultados: any[];


  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private authService: AuthenticationService,) { }

  ngOnInit(): void {
    this.factura = this.route.snapshot.paramMap.get('id');
    this.getResultados(this.factura);
  }


  getResultados(factura: string) {
    this.Cargando = true;
    let parametros: Parametro[] = [{ key: "factura", value: factura }]
    this.httpService.DoPost<any>(DataApi.Oferta,
      "GetOfertaResultadosSmart", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            console.log(response)

            this.fechaValidoHasta = response.valores[0];
            this.resultados = response.records
            let r = response.records[0]

            this.cliente = r.nombre
            this.factura = r.factura
            this.cedula = r.cedula
            // this.montoPromocion = r.montoPromocion
            this.notaCredito = r.notaCredito
            this.montoPromocion = this.resultados.map(artp => Number(artp.montoPromocion)).reduce((sum, current) => sum + current, 0);

          } else {
            this.toastService.warning("Factura no válida.");
          }

        }
        this.Cargando = false;

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

}
