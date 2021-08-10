import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cliente-negocio',
  templateUrl: './cliente-negocio.component.html',
  styleUrls: ['./cliente-negocio.component.scss']
})
export class ClienteNegocioComponent implements OnInit {

  @Input() clientId = 0;
  
  constructor() { }

  ngOnInit() {
  }

}
