import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
    toasts: any[] = [];

    show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
        this.toasts.push({ textOrTpl, ...options });
    }

    remove(toast) {
        this.toasts = this.toasts.filter(t => t !== toast);
    }

    Danger(error: string) {
        this.show(error, { classname: 'bg-danger text-light', icon: "fas fa-exclamation-triangle" });
    }
    Warning(error: string) {
        this.show(error, { classname: 'bg-warning text-light', icon: "fas fa-exclamation-triangle", delay: 1800 });
    }

    Success(mensaje: string = "Operación realizada.") {
        this.show(mensaje, { classname: 'bg-success text-white ', icon: "fas fa-check-square" });
    }

    MostrarMensajeDeErrorConexionServidor() {
        this.show("Error al conectar con el servidor", { classname: 'bg-danger text-light', icon: "fas fa-exclamation-triangle" });
    }

}
