import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cliente-finanzas',
  templateUrl: './cliente-finanzas.component.html',
  styleUrls: ['./cliente-finanzas.component.scss']
})
export class ClienteFinanzasComponent implements OnInit {
  @Input() clientId = 0;
  constructor() { }

  ngOnInit() {
    console.log(this.clientId+"from ClienteFinanzasComponent")
  }

}
