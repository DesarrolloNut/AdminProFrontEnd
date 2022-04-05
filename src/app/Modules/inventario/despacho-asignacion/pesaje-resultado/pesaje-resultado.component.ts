import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pesaje-resultado',
  templateUrl: './pesaje-resultado.component.html',
  styleUrls: ['./pesaje-resultado.component.scss']
})
export class PesajeResultadoComponent implements OnInit {
  codigoBarra: string = "100015"

  constructor(private route: ActivatedRoute,) { }

  ngOnInit(): void {
    let id = Number(this.route.snapshot.paramMap.get('id'));
    console.log({
      id
    })
  }

}
