import { Component, AfterViewInit, OnInit } from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
@Component({
  templateUrl: './prueba.component.html'
})
export class PruebaComponent implements AfterViewInit, OnInit {
  subtitle: string;

  public config: PerfectScrollbarConfigInterface = {};
  constructor(  private http: BackendService,   private toastService: ToastrService) {
    this.subtitle = 'This is some text within a card block.';
  }


  ngOnInit(): void {
    this.toastService.warning("Estoy chequeando 01");
    this.toastService.error("Estoy chequeando 02");
    this.toastService.success("Estoy chequeando 03", "OK");
  }

  ngAfterViewInit() { 

   // alert("Estoy chequeando")
  }
}
