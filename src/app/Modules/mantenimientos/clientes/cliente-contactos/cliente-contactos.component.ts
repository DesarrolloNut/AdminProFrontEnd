import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cliente-contactos',
  templateUrl: './cliente-contactos.component.html',
  styleUrls: ['./cliente-contactos.component.scss']
})
export class ClienteContactosComponent implements OnInit {
  @Input() clientId = 0;
  constructor() { }

  ngOnInit() {

    console.log(this.clientId+"from contactos")
  }

}
