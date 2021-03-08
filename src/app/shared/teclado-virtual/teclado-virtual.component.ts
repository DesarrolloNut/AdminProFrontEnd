import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { TecladoLayOuts } from '../enums/TecladoLayouts';
import Keyboard from 'simple-keyboard';

@Component({
  selector: 'app-teclado-virtual',
  templateUrl: './teclado-virtual.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./teclado-virtual.component.scss']
})
export class TecladoVirtualComponent implements OnInit {

  @Input() tipoTeclado: any = TecladoLayOuts.LayoutTecladoNumerico;
  @Input() mostrarInput: boolean = true;
  @Output() onClickBtnAceptar = new EventEmitter<string>();
  @Output() onTapValue = new EventEmitter<string>();
  value = "";
  keyboard: Keyboard;
  Layout: any = TecladoLayOuts.LayoutTecladoNumerico;


  constructor() { }
  ngOnInit() {
  }

  ngAfterViewInit() {
    this.keyboard = new Keyboard({
      mergeDisplay: true,
      display: {
        '{bksp}': 'Borrar',
        '{enter}': 'Aceptar',
      },
      onChange: input => this.onChange(input),
      onKeyPress: button => this.onKeyPress(button),
      layout: this.tipoTeclado,
      buttonTheme: [
        {
          class: "boton-primary",
          buttons: "{enter}"
        },
        {
          class: "boton-secondary",
          buttons: "{bksp}"
        },
      ],
    });
  }

  onChange = (input: string) => {
    this.value = input;
    this.onTapValue.emit(input);
    //console.log("Input changed", input);
  };

  onInputChange = (event: any) => {
    let valor: string = event.target.value

    this.keyboard.setInput(valor);
    this.value = valor;
    this.onTapValue.emit(valor);
  };

  onKeyPress = (button: string) => {
    //console.log("Button pressed", button);

    /**
     * If you want to handle the shift and caps lock buttons
     */
    if (button === "{shift}" || button === "{lock}") this.handleShift();

    if (button === "{enter}") this.handleEnter();

  };

  handleShift = () => {
    let currentLayout = this.keyboard.options.layoutName;
    let shiftToggle = currentLayout === "default" ? "shift" : "default";

    this.keyboard.setOptions({
      layoutName: shiftToggle
    });
  };


  handleEnter = () => {
    this.onClickBtnAceptar.emit(this.value);
  };

}
