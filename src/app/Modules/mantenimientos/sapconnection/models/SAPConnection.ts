export class SAPConnection {
  constructor() {
      this.id = 0;
      this.server = ""
      this.companyDB = ""
      this.userDB = ""
      this.passwordDB = ""
      this.dbServerType = ""
  }
  id: number;
  server: string;
  companyDB: string;
  userDB: string;
  passwordDB: string;
  dbServerType: string;
}
