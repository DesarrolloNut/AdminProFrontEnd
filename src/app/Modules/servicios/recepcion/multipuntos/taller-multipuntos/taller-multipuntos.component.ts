import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { MultipuntoOpcionesViewModel } from '../models/MultipuntoOpcionesViewModel';
import { MultipuntoRespuesta } from '../models/MultipuntoRespuesta';
import { MultipuntoRespuestaViewModel } from '../models/MultipuntoRespuestaViewModel';

@Component({
  selector: 'app-taller-multipuntos',
  templateUrl: './taller-multipuntos.component.html',
  styleUrls: ['./taller-multipuntos.component.scss']
})
export class TallerMultipuntosComponent implements OnInit {


  citaID: number = 0;
  loadingOpciones: boolean;
  opciones: MultipuntoOpcionesViewModel[] = [];
  respuestas: MultipuntoRespuesta[] = [];
  loadingColores: boolean;
  colores: ComboBox[] = [];
  categoriasPadres: string[] = []
  categoriasHijas: { "categoria": string, "categoriaPadre": string }[] = []
  btnGuardarCargando: boolean;
  respuestasAnteriores: MultipuntoRespuestaViewModel[];


  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.citaID = Number(this.route.snapshot.paramMap.get('id'));

    if (this.citaID > 0) {
      this.getMultipuntoOpciones()
      this.getMultipuntoColores()
    } else {
      // this.toastService.warning("Cita no encontrada");
      this.router.navigateByUrl('/servicios/multipuntos');
    }

  }


  guardarRespuestas() {
    this.respuestas = this.opciones.map(x => {

      let respuesta: MultipuntoRespuesta = {
        citaID: this.citaID,
        id: 0,
        multipuntoEstado: x.multipuntoEstado ?? "false",
        multipuntoOpcionID: x.id,
        respuesta1: x.respuesta1 ?? "",
        respuesta2: x.respuesta2 ?? "",
        respuesta3: x.respuesta3 ?? "",
      }

      respuesta.multipuntoEstado += ''
      respuesta.respuesta1 += ''
      respuesta.respuesta2 += ''
      respuesta.respuesta3 += ''

      return respuesta;
    })

    this.btnGuardarCargando = true;
    this.httpService.DoPostAny<MultipuntoOpcionesViewModel>(DataApi.Multipunto,
      "RegistrarMultipuntoRespuesta", this.respuestas).subscribe(response => {
        this.btnGuardarCargando = false;
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.toastService.success("Realizado", "OK");

          this.router.navigateByUrl('/servicios/multipuntos');
        }

      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });

    console.log(this.opciones)

  }


  getMultipuntoOpciones() {
    this.loadingOpciones = true;
    this.httpService.DoPost<MultipuntoOpcionesViewModel>(DataApi.Multipunto,
      "GetMultipuntoOpciones", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          this.opciones = response.records;
          this.getMultipuntoRespuestas()
          for (let i = 0; i < this.opciones.length; i++) {
            this.respuestas.push(new MultipuntoRespuesta())
          }
        }
        this.loadingOpciones = false;

      }, error => {
        this.loadingOpciones = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



  formatearOpciones() {
    // this.opciones.forEach(x => x.respuesta1 = 1)
    this.categoriasPadres = Array.from(new Set(this.opciones.map(x => x.categoriaPadre)))
    this.categoriasPadres.forEach(cp => {

      let categoriaHijasNombres = Array.from(new Set(this.opciones.filter(x => x.categoriaPadre == cp).map(x => x.categoria)));
      categoriaHijasNombres.forEach(chn => this.categoriasHijas.push({ "categoria": chn, "categoriaPadre": cp }))
    })

  }

  getMultipuntoRespuestas() {
    this.loadingOpciones = true;
    this.httpService.DoPostAny<MultipuntoRespuestaViewModel>(DataApi.Multipunto,
      "GetMultipuntoRespuestas", this.citaID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.respuestasAnteriores = response.records
          console.log(this.respuestasAnteriores)

          if (this.respuestasAnteriores && this.respuestasAnteriores.length > 0) {

            this.respuestasAnteriores.forEach((a, i) => {
              this.opciones[i].respuesta1 = Number(a.respuesta1);
              this.opciones[i].respuesta2 = Number(a.respuesta2);
              this.opciones[i].respuesta3 = Number(a.respuesta3);
              this.opciones[i].multipuntoEstado = (a.multipuntoEstado == 'true')
            })
          } else {

          }
          this.formatearOpciones()

        }
        this.loadingOpciones = false;

      }, error => {

        setTimeout(() => {
          this.getMultipuntoRespuestas()
        }, 1000);

        this.loadingOpciones = false;
        this.toastService.error("Multipuntos", "Error conexion al servidor");
      });
  }

  getMultipuntoColores() {
    this.loadingColores = true;

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetMultipuntoColores", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.colores = response.records;
        }

        this.loadingColores = false;
      }, error => {
        this.loadingColores = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

}
