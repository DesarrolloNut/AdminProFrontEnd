import { Component } from '@angular/core';

import { ToastService } from './toast.service';

@Component({
	selector: 'app-ng-toasts',
  	templateUrl: 'toast.component.html'
})

export class ToastComponent {
		constructor(public toastService: ToastService) {}

		show = true;
		showauto = false;
		autohide = true;

		close() {
			this.show = false;
			setTimeout(() => this.show = true, 5000);
		}

		showStandard() {
			this.toastService.show('I am a standard toast');
		}

		showSuccess(mensaje: string = "Operación realizada.") {
			this.toastService.show(mensaje, { classname: 'bg-success text-light', delay: 10000 });
		}

		showDanger(mensaje: string = "Ha ocurrido algún error.") {
			this.toastService.show(mensaje, { classname: 'bg-danger text-light', delay: 15000 });
		}

		Warning(error: string) {
			this.toastService.show(error, { classname: 'bg-warning text-light', icon: "fas fa-exclamation-triangle", delay: 1800 });
		}
		MostrarMensajeDeErrorConexionServidor() {
			this.toastService.show("Error al conectar con el servidor", { classname: 'bg-danger text-light', icon: "fas fa-exclamation-triangle" });
		}
		MostrarMensajeDeErrorInterno(mensaje:string) {
			this.toastService.show("Error interno!  "+ mensaje, { classname: 'bg-danger text-light', icon: "fas fa-exclamation-triangle" });
		}
}
