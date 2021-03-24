export class SAPConnection {
  constructor() {
      this.id = 0;
      this.server = ""
      this.companyDB = ""
      this.userDB = ""
      this.passwordDB = ""
      this.dbServerType = 0
      this.inUse = false;
  }
  id: number;
  server: string;
  companyDB: string;
  userDB: string;
  passwordDB: string;
  dbServerType: number;
  inUse: boolean;
}
