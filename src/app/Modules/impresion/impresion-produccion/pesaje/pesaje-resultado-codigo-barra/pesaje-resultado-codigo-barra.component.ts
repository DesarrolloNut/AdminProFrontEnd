import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pesaje-resultado-codigo-barra',
  templateUrl: './pesaje-resultado-codigo-barra.component.html',
  styleUrls: ['./pesaje-resultado-codigo-barra.component.scss']
})
export class PesajeResultadoCodigoBarraComponent implements OnInit {
  @ViewChild('search') searchElement: ElementRef;
  codigoBarra: string = "3"

  searchValue: string = ""
  private unlistener: () => void;

  constructor(private route: ActivatedRoute,
    private renderer2: Renderer2) { }

  ngOnInit(): void {

    // this.unlistener = this.renderer2.listen("document", "mousemove", event => {
    //   console.log(`I am detecting mousemove at ${event.pageX}, ${event.pageY} on Document!`);
    // });

    // this.unlistener = this.renderer2.listen(".pesajeDiv", "mousemove", event => {
    //   console.log(`I am detecting mousemove at ${event.pageX}, ${event.pageY} on Document!`);
    // });


    let id = Number(this.route.snapshot.paramMap.get('id'));
    console.log({
      id
    })
  }


  setFocus() {
    // this.show = !this.show;
    setTimeout(() => { // this will make the execution after the above boolean has changed
      this.searchElement.nativeElement.focus();
    }, 0);
  }

  @HostListener('window:keydown', ['$event'])
  onWindowKeyDown(event: any) {
    this.setFocus()
  }
  @HostListener('window:keyup.enter', ['$event'])
  onWindowKeyupEnter(event: any) {
    console.log(this.searchValue)

    setTimeout(() => {
      this.searchValue = ""
    }, 2000);

  }

  ngOnDestroy() {
    this.unlistener();
  }

}
