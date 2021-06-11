export class EnrrollVendedorEntregaSupervisor  {

  constructor() {
    this.id = 0;
    this.empleadoIdVendedor = 0;
    this.rutaIdVendedor = 0;
    this.empleadoIdEntrega = 0;
    this.rutaIdEntrega = 0;
    this.empleadoIdSupervisor = 0;
}
  id: number;
  empleadoIdVendedor: number;
  rutaIdVendedor: number;
  empleadoIdEntrega: number;
  rutaIdEntrega: number;
  empleadoIdSupervisor: number;


}


export class EnrrollVendedorEntregaSupervisorVista  {

  constructor() {
    this.id = 0;
    this.empleadoVendedor = "";
    this.rutaVendedor = "";
    this.empleadoEntrega = "";
    this.rutaEntrega = "";
    this.empleadoSupervisor = "";
  }

  id: number;
  empleadoVendedor: string;
  rutaVendedor: string;
  empleadoEntrega: string;
  rutaEntrega: string;
  empleadoSupervisor: string;
}
