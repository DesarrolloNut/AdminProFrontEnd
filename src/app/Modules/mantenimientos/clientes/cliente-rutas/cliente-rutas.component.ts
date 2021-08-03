import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cliente-rutas',
  templateUrl: './cliente-rutas.component.html',
  styleUrls: ['./cliente-rutas.component.scss']
})
export class ClienteRutasComponent implements OnInit {
  @Input() clientId = 0;
  constructor() { }

  ngOnInit() {
    console.log(this.clientId+"from ClienteFinanzasComponent")

  }

}
