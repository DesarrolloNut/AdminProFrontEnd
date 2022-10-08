
import { Injectable } from '@angular/core';
import * as moment from 'moment';
// import * as FileSaver from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from "pdfmake/build/vfs_fonts";
import JsBarcode from 'jsbarcode/bin/JsBarcode'
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as _ from 'underscore';
import { BarcodeService } from 'src/app/Services/barcode.service';

@Injectable({
  providedIn: 'root'
})
export class Imprimir {


  constructor() { }
  // IMPORT EXCELJS GLOBAL
  private readonly Excel = require('exceljs');
  private barcodeService: BarcodeService;
  private Workbook: any;
  private Worksheet: any;

  //Propiedades de Ingresos e Egresos
  conIngresoEgreso: boolean=false;
  private DataDeIngresosEgreso = [];



  // CUSTOM FORMAT FONTS
  private readonly fontSizeTitle: number = 18;
  private readonly fontSizeSubTitle: number = 16;
  private readonly fontSizeHeader: number = 14;
  private readonly fontSizeTableHeader: number = 10;
  private readonly fontSizeTableGroup: number = 10;
  private readonly fontSizeTableBody: number = 8;



  private DATA: Array<any> = [];

  private readonly FontStylesPDF = {

    // FORMAT FONTS TITLE
    fontCenterTitle: { fontSize: this.fontSizeTitle, bold: false, alignment: 'center' },
    fontLeftTitle: { fontSize: this.fontSizeTitle, bold: false, alignment: 'left' },
    fontRightTitle: { fontSize: this.fontSizeTitle, bold: false, alignment: 'right' },
    fontCenterBoldTitle: { fontSize: this.fontSizeTitle, bold: true, alignment: 'center' },
    fontLeftBoldTitle: { fontSize: this.fontSizeTitle, bold: true, alignment: 'left' },
    fontRightBoldTitle: { fontSize: this.fontSizeTitle, bold: true, alignment: 'right' },
   
    // FORMAT FONTS SUBTITLE
    fontCenterSubTitle: { fontSize: this.fontSizeSubTitle, bold: false, alignment: 'center' },
    fontLeftSubTitle: { fontSize: this.fontSizeSubTitle, bold: false, alignment: 'left' },
    fontRightSubTitle: { fontSize: this.fontSizeSubTitle, bold: false, alignment: 'right' },
    fontCenterBoldSubTitle: { fontSize: this.fontSizeSubTitle, bold: true, alignment: 'center' },
    fontLeftBoldSubTitle: { fontSize: this.fontSizeSubTitle, bold: true, alignment: 'left' },
    fontRightBoldSubTitle: { fontSize: this.fontSizeSubTitle, bold: true, alignment: 'right' },
    //----------------------------------------
    // FORMAT FONTS HEADER
    fontCenterHeader: { fontSize: this.fontSizeHeader, bold: false, alignment: 'center' },
    fontLeftHeader: { fontSize: this.fontSizeHeader, bold: false, alignment: 'left' },
    fontRightHeader: { fontSize: this.fontSizeHeader, bold: false, alignment: 'right' },
    fontCenterBoldHeader: { fontSize: this.fontSizeHeader, bold: true, alignment: 'center' },
    fontLeftBoldHeader: { fontSize: this.fontSizeHeader, bold: true, alignment: 'left' },
    fontRightBoldHeader: { fontSize: this.fontSizeHeader, bold: true, alignment: 'right' },
    // FORMAT FONTS TABLE HEADER
 
    fontCenterBoldTableHeader: { fontSize: this.fontSizeTableHeader, bold: true, alignment: 'center' },
 
    // FORMAT FONTS TABLE GROUP
    fontCenterTableGroup: { fontSize: this.fontSizeTableGroup, bold: false, alignment: 'center' },
    fontLeftTableGroup: { fontSize: this.fontSizeTableGroup, bold: false, alignment: 'left' },
    fontRightTableGroup: { fontSize: this.fontSizeTableGroup, bold: false, alignment: 'right' },
    fontCenterBoldTableGroup: { fontSize: this.fontSizeTableGroup, bold: true, alignment: 'center' },
    fontLeftBoldTableGroup: { fontSize: this.fontSizeTableGroup, bold: true, alignment: 'left' },
    fontRightBoldTableGroup: { fontSize: this.fontSizeTableGroup, bold: true, alignment: 'right' },
    
  };

  private readonly FontStylesExcel = {

       // HORIZONTAL: left, center, right, fill, justify, centerContinuous, distributed
      // VERTICAL: top, middle, bottom, distributed, justify

    Title: {
      Font: { family: 2, size: 20, bold: true },
      Alignment: { vertical: 'middle', horizontal: 'left', wrapText: false }
    },
    SubTitle: {
      Font: { family: 2, size: 18, bold: true },
      Alignment: { vertical: 'middle', horizontal: 'left', wrapText: false }
    },
    Header: {
      Font: { family: 2, size: 16, bold: true },
      Alignment: { vertical: 'middle', horizontal: 'left', wrapText: false }
    },
    TableHeader: {
      Font: { family: 2, size: 15, bold: true },
      Alignment: { vertical: 'middle', horizontal: 'center', wrapText: false },
      Border: {
        // top: { style: 'medium', color: { argb: 'FF000000' } },
        //left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
       // right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    },
    TableGroup: {
      Font: { family: 2, size: 14, bold: true },
      Alignment: { vertical: 'middle', horizontal: 'left', wrapText: false },
      Border: {
        //top: { style: 'thin', color: { argb: 'FF000000' } },
       // left: { style: 'thin', color: { argb: 'FF000000' } },
       // bottom: { style: 'medium', color: { argb: 'FF000000' } },
        //right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    },

    TableBody: {
      Font: { family: 2, size: 14, bold: false },
      Alignment: { vertical: 'middle', horizontal: 'center', wrapText: false },
      Border: {
        //top: { style: 'thin', color: { argb: 'FF000000' } },
        //left: { style: 'thin', color: { argb: 'FF000000' } },
        //bottom: { style: 'medium', color: { argb: 'FF000000' } },
        //right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    },

    TableTotal: {
      Font: { family: 2, size: 14, bold: true },
      Alignment: { vertical: 'middle', horizontal: 'center', wrapText: false },
      Border: {
        top: { style: 'medium', color: { argb: 'FF000000' } },
        //left: { style: 'thin', color: { argb: 'FF000000' } },
        //bottom: { style: 'medium', color: { argb: 'FF000000' } },
        //right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    }

  };

  //#region CREATE DATA GROUP AND TOTAL GRUPO

  private CreateOneGroupWithKey(collection, property) {
    const groupBy = key => array =>
      array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        if (!isUndefined(value) && value != null) {
          objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
          return objectsByKeyValue;
        }
        return [];

      }, {});

    const groupByData = groupBy(property);
    return groupByData(collection);

  }

  private CreateOneGroupWithoutKey(collection, property): any {

    var result = _.mapObject(_.groupBy(collection, property),
      clist => clist.map(collection => _.omit(collection, property)));
    return result;
  }

  private CreateGroupForProperty(colletion, propertys: Array<string>) {


    //VALIDATIONS
    let validate = true;
    for (var i = 0; i < propertys.length; i++) {
      let data = colletion[0].hasOwnProperty(propertys[i]);
      if (!data) {
        validate = false;
        break;
      }
    }

    //DATA
    if (validate) {
      let colletionInit = this.CreateOneGroupWithoutKey(colletion, propertys[0]);
      for (var key in colletionInit) {
        for (var y = 1; y < propertys.length; y++) {
          colletionInit[key] = this.CreateOneGroupWithoutKey(colletionInit[key], propertys[y]);
        }
      }
      return colletionInit;
    }
    return [];
  }




  //#endregion

  //#region METHODS UTILITIES


  private NumberFormat(x, formatNumber: FormatNumber = FormatNumber.NORMAL, visibleCero: boolean = false) {

    if (!Number.isNaN(Number(x))) {

      if (!visibleCero && parseInt(x) == 0) {
        return null;
      } else {
        switch (formatNumber) {

          case FormatNumber.CURRENCY:
            return String(parseInt(x).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));

          case FormatNumber.NORMAL:
            return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

          default:
            return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
      }

    } else {
      return null;
    }
  }

  private SumEqualProperty(collection: Array<any>) {

    var total = _.reduce(collection, function (acc, obj) {
      _.each(obj, function (value, key) {

        if (!Number.isNaN(Number(value))) {
          //validations
          value = value == null ? 0 : value;
          acc[key] = (acc[key] ? acc[key] : 0);
          //data
          acc[key] = parseInt(acc[key]) + parseInt(value.toString());
        } else {
          acc[key] = value;
        }

      });
      return acc;
    }, {});

    return total;
  }

    //#endregion

  public ExportFile(collection: Array<any>, CompanyName:string,ReportName: string, Header: string,Titulo:string, ReportType: TypeReport, ReporteKey: string, PropertyForGroup: Array<string> = []) {

   

    if (PropertyForGroup.length != 0 && PropertyForGroup != null) {
      this.DATA = _.omit(this.CreateGroupForProperty(collection, PropertyForGroup), PropertyForGroup);
    } else {
      this.DATA = collection;
    }
    let workbook = this.Workbook = new this.Excel.Workbook();
    this.Worksheet = workbook.addWorksheet(ReportName, { properties: { defaultColWidth: 20 } });

    switch (ReporteKey) {

      case 'RPT005':
       // ADD OTHER TEMPLATE HERE
      case 'RPT006':
         // ADD OTHER TEMPLATE HERE
      case 'RPT007':
        
        return this.BuildReportTemplate(CompanyName,ReportName, Header,Titulo, ReportType, this.TemplateReport_PickingTransferenciaInventarioPDF,null);
        

      default:
        break;
    }

  }

  // #region EXPORT AND BUILD METHODS

  private ExportAsView(CompanyName:string,ReportName: string, Header: string, TemplateCallBack: (collection, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) => Array<any>) {

    var Data = TemplateCallBack(this.DATA, this.NumberFormat, this.SumEqualProperty);

    const documentDefinition = {
      //left / top / right / bottom
      pageMargins: [40,35,40, 0],
      content: [
        { text: CompanyName, style: 'fontCenterBoldSubTitle',decoration:'underline' },
        { text: '', margin: [0, 5], },
        { text: ReportName, style: 'fontCenterBoldSubTitle' },
        { text: '', margin: [0, 5], },

        { text: Header, style: 'fontCenterHeader' },
        { text: '', margin: [0, 4], border: [false, false, false, true] },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                headerRows: 1,
               // widths:'auto',
                body: Data
              }
            },
            { width: '*', text: '' },
          ]
        }
      ],
      styles: this.FontStylesPDF

    };


    pdfMake.createPdf(documentDefinition).open();
  }

  private ExportAsViewHorizontal(CompanyName:string,ReportName: string, Header: string, TemplateCallBack: (collection, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) => Array<any>) {

    var Data = TemplateCallBack(this.DATA, this.NumberFormat, this.SumEqualProperty);

    const documentDefinition = {
      pageMargins: [40,35,40, 0],
      content: [
        { text: CompanyName, style: 'fontCenterBoldSubTitle',decoration:'underline' },
        { text: '', margin: [0, 5], },
        { text: ReportName, style: 'fontCenterBoldSubTitle' },
        { text: '', margin: [0, 5], },

        { text: Header, style: 'fontCenterHeader' },
        { text: '', margin: [0, 4], border: [false, false, false, true] },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                headerRows: 1,
                // widths:'auto',
                body: Data
              }
            },
            { width: '*', text: '' },
          ]
        }
      ],
      styles: this.FontStylesPDF
    };
    pdfMake.createPdf(documentDefinition).print();
  }

  private ExportAsPDF(CompanyName,ReportName: string, Header: string,Titulo:string, TemplateCallBack: (collection, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) => Array<any>) {
    
    const Data = TemplateCallBack(this.DATA, this.NumberFormat, this.SumEqualProperty);
    let encabezado:any= this.DATA[0]
     if(encabezado.HechoPor==undefined || encabezado.HechoPor==''){
        encabezado.HechoPor='';
      }
      if(encabezado.RecibidoPor==undefined || encabezado.RecibidoPor==''){
        encabezado.RecibidoPor='';
      }
      if(encabezado.ValidadoPor==undefined || encabezado.ValidadoPor==''){
        encabezado.ValidadoPor='';
      }
    let fechaEntrega =moment(encabezado.FechaEntrega).format('YYYY-MM-DD')
    let textForBarcode = fechaEntrega.split('-').join('');
    const documentDefinition = {
      pageMargins: [40,35,40, 100],
      content: [
        //C:\ProyectosNutriciosa\NutriciosaAdminFrontEnd\src\assets\images\nutriciosa.png
        
        {
          image: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAOoAAACHCAYAAAAY/sXKAAAABHNCSVQICAgIfAhkiAAAIABJREFUeJzsnXecJGWd/99PhY7Tk8PObM5sICxLzmkBEUQJYkTwOMGIIifemRA9VEBEhEMUARVRFBRFFJGcWcKSdhc2x9nJqWPF5/dHVXdXT89O9wD+xLv57Kt2qp96Ktfn+cbneWASk5jEJCYxiUlMYhKTmMQkJjGJSUxiEpOYxCQmMYlJTGISk5jEJCYxiUlMYhKTmMQkJjGJSUxiEpOYxCQmMYlJTGISk5jEJCYxiUlMYhKTmMQkJjGJSUxiEpOYxCQmMYlJTGISk5jEJCYxiUn834D4Z1/A/3VIKWOQbYSRemy3HpGtc123Djddg5AJXLtGilwUKWNAVDqZMMINSUkYKTUppYYrNYRUcKUA4b1TBdc7gbCFwEYIWyiqhcAQImIi9CyCLIisELE0UqZQtKSiRJKgDSOjw2jqILQMAENCCPef95QmMUnUtxlSSg0GpmBnOhw30yEdcwoy0yrddJttJFtsI9XsGEMttpFstM10g2NZUdeycCwL17ZwbAvXsnEdG9f2/krHwXUcXMdFug5SvnnOCCEQQkGoKoqqIhTvr6JpKKrm/dU1VE1H0XVULYQa0l1VCw2r4boBLRzv1yK1vVq4sV/Rot1CjXQrxLqlHt+lqvGd0LRLCDH8Nj7SSTBJ1DcFKWUCq3Oe64wsdO3B+a6bmm3nBmYbqe7ZZmZompXNqHYui5XNYuWy2EYW2zDgLRDsnQhF1dEiUbRIBD0aQ49EvSUaHQnFW7eEato2qXrtJqE2bBBKzTo13LAeGrYLIeQ/+9r/1TBJ1HEgpYzZ9vbF0hzYy7UH97RzPYuMkc7FRnpgmpXJCDOdwsyksbIZpGP/sy/3nQch0MIR9FicUCyOHoujR2vSkbqpr0fiba8LvWGNqja/qkabXhaicds/+3LfyZgkKiClFJh98yyrd5lr9y01s917ZYe27Wml+2damYxqZlJYmTSOmXubzyw8FdRXO4Wqeepo4a+nmiJdpCuR/l+kRCKhIJcqCShR+JNXfVFEcR089doNqtk20i6q4G+3NiAU1ZPCsRqfxInhSG376kjtzFdFuOE1VW18SYvMeUkIkXpbT/wviv+TRJVSxh1j00FWtvMwI7PtMGN42/5GcrjOSA1jplI41ttDSKGoqHoIVQ+h6CHUUAhF1Qsfv2PZOEYOy8jhGDlsw8A2DRzTwLEsHNPwSfKP1RSFoqCEQmh6CDUURg2F0MIR1FDYU2sjUVRd9xoUTQPAs6tNHMvAtUwcy6Jyg1HFtQgVPRYnXFNLKFHrRhMtb4TqZj+rhdufCIemPybCLevf8kn+BfF/gqhSypiT2XCYmdt6bC65+Zjc0M59jHRSM5PDWNn0Wz6+kv/A9TBqKIzrujim4dmomTRWJoWZTmNl09i5HDJPPAlJB4ZNSFqSpC1IWZKUDWlHkHUg40LOAcMFQypYEmzARsGW4AIuAillCU0EvvQEFAEqEg2JjkQToAtJRJGEFUFUkURViKuSmCZIqJKELkhoUBeCOh00pXhsVdN8aRhHj+clYg1aOIyq60jHwbEMHDOHY5pI13lrz1fVCHnEJVxT3x1tnPdIKDbrwXBoxiP/V4j7v5aoprl9Tye15fhcavO7soNbDjNTI2EjNYJjZN/8QYXiS5wwSiiM6zjYuSxmKomZGsFIDmMkk7i25V2DK+jJSfpykp4c9BvQb8KgJRh2BElXQSoCVVNQNQVFU9BDqrfoCrquoOkKmr9dVQWKKlAUEEpejaXkLY5+odL/T0qQrsR1vb+OK3FsiW1LbMvFtl0s08GyvL+26XmZHdvFtV3CSGpVSb3q0hSCxhC0RKAlImiJQEPIP78QaNEY4UQt4USdR7BYHDUcQTq2T14D6T+jN/caVELxBKGaWsKJxm2R+gV/C8fn/iVUs+ghIcTImz7wOxj/a4gqZbIlN7LhODOz/dhs/xvHG+n+6VYmhZ3NFCXYBCAUBUUPoWghhKJi5TJY2QzGyDBGchgzNYJrWWQd2JWRdGUkXTnozkG/Jei3FdJSQdUV9LBGOKoRieqEIyqhiIYe8smnC3RdoGoCRRMIIREKIGSBhEJIpAAlUAbS3zb6wkc/mNJ1KUWhTLqi+FcCUniElgLp5EnsEdqxXCxLYhkuRs72lqyNkbWwTAfVcWlQXRo1l+YwtEdgSlQwJSZoDoOigB6rIZyo8wmcQI9EUXQd1zK9xbHelPasaBqheAI9GrciDTOfjibm3x+KT/+7Fp39/P+W+O+/NFGlTLVlB1e/Lzu8+gPZoW2HW+mkYmVSSDlxVUsI1SOmHsaxbYyRIXJDA+SGBzBTI0gpGbEEG4ddNiUl29KSHTmFIUdBD6voEY1YTZhYTYhwVEOPqIQiik9IAYpPQEV6JPTJ6JV7pEORKPnyPAkDZA2SUiiBl+fX3d3LlPhmbp6g/nqwzHUFQoJEeH4jn7zS9X4LKfx1AVKAW9xmmS5WzsU0HKycQzZtkUmZ5NImluGgOg5TQi7TY5LZNQpzawVT4wJVSFQ9RKSukUi9t4RiNUjXxrUMXzOZOHPVUIRQLEEo0dAZbVh6V6xm/l1azbzH/5VJ+y9HVCllLDf4wqmZ4TVn54Y2r7CyKdXOpifucBEgVB2hhXAdl+zQANmBXrKDfThGFtuFLUnJhmGXN4Ylm7MKI65CKKIRjYeI14aJxEOEYhrhiIoeVkDFI50SIKAikUqgXIBSICYIXzLiE01Riq8kT0whJIoYde2iWEf4ZYHN3rMqe3bFxxQkKYCbl7YE68jiPgVyC4/EboDQeQL7v6Vf5loSM+dgZB2MjE0maZAeMTCyFsJyaA+7zEvAwjrB/DqFhjAgFCJ1DUQbW4g2NPvEtZC2Ce7EeaboIbRoDaF4fWe0Yc/bo82Lbw2FZqye8IH+yfiXIKqUUjdG1hyXHl794dzA66fauXSNY2SRE31xigqKhuu4GMlhcoN9ZAf7sLNpRkzJ64Mu64clG9OwI6cgdU9KxusiRGp0QlGNUFRDC1EgIwoIVSKD6yJPUgokVChKyMJDVyQFH40QCKS3TRGBck+SFoiJJ039XcoJnK8EFCI4ZYT0N7vFTUVCeju7fqH0pWx+Jxc8chJoG6XPIVkkK06AwA5FQjtgZh1/scmMGKSGcxhZiwbFZVbUZV6tYI8GwYwaBVVVCdc1EG1oJlLfhB6Lg2t7ywQbZ0UPoUWiUo+3ro437H17Td3et4tow9YJHeSfhHc0UWV2cOZQ31Ofyg6+do5jJFtdMzPh9DmJghQaVi5Hpq+bTF8XZmoYV8Ibgy4v9jqsHpLsMlVCMZ14bZR4XZhITYhwXEPVBag+6VSfnP5f6ZcLUSRlKcGKj1cNeE0LxUKiimKhyNNGiCIBhU/mPOFF6XG8c0jfueSXM8o0lfkwqChIyTzcgLT0yCkC5dJ/hkWiOgEyjz5OUBLj28JSAq5AOEXSClcgfSLjeGVmziGXssgmTVJDWbIpE92xWFAj2bNRYd9WlcawQNF0ok2txJrbidY1eNoGzqg7rgxFC6GEYm4oPu3hmtYDfhSt3/NP7+SMqXckUTMj6w/K9K28MDe04XTXzukT9RBKwJUKVs4g3buLTO8u7GyKjC1Z1ePwQq/DmmGBpenEEmHi9VGiiRCRRAhVB1Q8CanKwnpeako1QExGSbWAtBRilLRUClUCtqYsUXXHJGTJcbzyAiELlYJOpjFU3wKJ8s4jn4AyQFTGIipFAvtwXVk8TiDnQrqUSN2CGk3gONLbKGReyireX5+0wvEkLo7AyNjkkibZpElyKIOZMekIuezTCAdO0ZiRUBCKSqShmVhLB9GGZlRFokyQa0IIRCiCFm7YEG9cdn2i/aib34me43cMUaWUerrv+dNSfSsvtLO9B+OaE5Ke0pXYDpiZLJm+LrL93VjpEfpykpVdNq8MSDakFdSITk19jGhtmEgihB5VQcWXkIDqBtaDNuYo501+VXgeTQK/vSoBu9KPZ+Z3ChI7KCEVMVadUokavAZFESWkF6WtQP7BlpJU5slGqWo8lkT1t7mBbz9IbBnYX+YL/DoycL7Cvm5A6ub/C9i5Ik9aRyDc4rprgZE2ySVNUkM5MsNZGhSHJXWSZS0qS5pVQrpGpL6FaFMbscZmL6SljvE8xoFQdIQaTkbr97w1NmXZDyORGRur3vkfjH86UaWUaqr7qXNHup/6Om56OnIiObNeDNDMWaR7u8j07cRMDpOxJU/utHmqy2FLViUSDxNviBGr88gpNApELCGkClJ1PeLmiRGQUiUEI7AeJFthQ9BLK0psVALrweMIdkP6oDMpKDWDsVT/nGMjIAGlx0g5apexnEnF8kC9wD5B77EbOFiwYci7ESS7P44bbDB81ThPWuGIAmHz26ysTWbYIDucIz2cRbMs9muCw6dqLGjwUjKjTVOIt04jUluLHlJQgg+2IhSkUN1QfPZddTNXfCMcbl87gZ3/IfinEVVKKUa6nzkz2f3UN4VM76EoE5GeLkbWIptMkenZQaZvF65t8Xq/w8PbLV4YACXiqbSx+ijR2jBCp0BMqfpSUpW4vnqbl5wewYqiSwkQq8Q+ZJSDZwyVVVCsJEYdK19YcpxAw1A4t/CvKXCOwn7B41f4DgvKiZ/BFJSkRRVWlEnQ0Z7ioHMqWO4GdvDqlKrQJWpyYD1fRwZICyBc75qFK1CCRC0hMB5phwzSg1kyyRwtqs1RHQpHTNep0QWhRAOxlqnEmtuIxEJoulq9lJUCx1GsUGL+LS1TV1wmYk07q9vx7cc/haiZ/vUHDe6870fIof00bbTrY/dwHZdsKkdmcJB091aMoV5MR/LwVou/b3foc1RiiQixhhix+ghqRPXIqXjkRJVILfgbj5wlkk0iEOXkKSGHLCFKkGwl9mqerIF6o8mZ32csG7NUrZaFsiD5gRLij4nRxCqUBx1LRQlYXi9gzxZ3HVPt9SSnKJGWpfWDDYUoaTTKGwVZILxHUoHigPSJWkJaG3Ipk8xglvRQBidrsn+z5N1zQkxPqKihMLGWadS0TSOSiBGOhKr++qUrsEyZiTUv+17jjHd/TwhhVLfn24f/r0TN5bbPG9z8wDddY/sHQhFdqfbstmGRSWZIdu8i07sDOz3MjqTL3zabrOwDNxQi3hAjWhchVBPyJGRQevp/XVWClpecpR99afhElpAwKF2DHtugs2hsVTgQWskfizGOFTh3SYNAaUOBlIG4aenDqyQkyiIZecJIf+fRRKFc6gaPVULa/PEK9UqlKRTDPcV1UX6sMjIXr8sFRP54DiijiFokMDg5l9xIjsxQlvRwlplRlyM7FA6dFiIS0ok0thFvm05NYz2ReDTglBsfjiWxTHVrYspB36prP+JWIcRbS2KeAP6/EFVKqfZtvufL2YEXvx6rjYVUrTp7wTJMRvqGGenuJNe7HcfIsH7A5u71Bq8OK0RrPOkZrY+ihIQnIfN2p09IV/OJqkhcZZTXVAQJ4RFJClBG2Ze7U20LTh7yUlKMT7RCPQr1GF0v8Hssb3L+3IXzIXEd/G5weLnA2jivVUI2adO9Mc1In4FjuGhhhURLmNY5ccIxrUQVhVIC+4coU2cLKvMYRC/pMCAZ27ucXw/YuS75bCkKaaBBW1e4gC0KpBWBv543GcykSXogSy6ZI2QZnDBD5YQ5YSKaQrihjVjbDOpbm4jV1ZSE08Z7frmMiWWGXp4y5/RzQg2zX6q801vHP5yoRnLr4q7Xf3dLOGYfEImHq9rHdRyGe4cY3rWTTPcWnFyGHUmH29fkWD0siAQIKnRRJKcqcQNkdf3feY9tXngE/QqKyJeL3au/jK3+ljmSoMD+McnqQzouVtZLt7NyjrduujiGi2U42IYLAmqbw7QvrCEU1wgcGjNt89J93fRuThc9uIFztS9IsM9JbWhhtXhOCZlBizWP9LJrfXJMa0Mo0LGwloVHtBCp0Uj2GfRuSoMQaJF8qqSCHtWI1esEFPsyMhecRVKWhnfyxBxL7Q0eK6D2euEe72wlHmhfTVdcT6IWyGoHSQs4AitjkxnIkB3OoloGp8zWOHFOBE0VRBo7qGmfSX1bM9FErPzBjAHXkSQHk0a0bt9LW+adfOU/Wrr+w4gqpVR6N917cW5o1WW1zbVhVVOr2YfhngEGduwg27MdOz3E5iGbu9cZvDQIkZoo0YYo4boIQhMlntsCQTWPnG7QZzCaUP669MtLbce8/ReQqiLgtSV43KI31rUkZsbGStuYmfziZd9YWY+MZtbGyrk4VvWOM6EIZuxVx8IjWtDCXlPyzO3bGNg5fi+gjj1qWf6edu8+gW0vDbH64R4cq7I/QI+odCyqZdtLg7tN/onUaOx5Uge1bVHv/vMnAlL9Br0bkiR7DRzTQQ0pxJvCNMyIU9MaJf/ZlTmj8lJTEgjvyCKZ8YiaD5WOtpmFS4Gkiq8eY/sE9j3JVsYmO5QlO5Ql7pqcOFNlxZwIIV0n3NhBon0GTdPaCMeiFZ8TQGYkQy6tvtA+573nhhrnvlrVTm8C/xCiSplq2/rCTbdH4uYxicbaqvbJjKTo2byd1K7NWMO9pE2XX76a5akeCMdCRBtiROsjSK1UxZUquH64xVW9bCEZsAnLwiCUSjgBJSl5AY23hJxIT5LlRkyMEQsjaZEbMcmNWBgpG9v4x5or9e1RDnj/NFxL8sD/bABgSlMLS2YvQFNVVMULQTz+8nMMp5JoIYUTLpwPSNY+1MumFwYLx5o5ZSqfPP1sjtj3IJrrG+kZ7OPh557k+t/9nK6B3qqvqaY5zAEfmFWQmEbKZv1j3fRt2v2gDIm2KHOPaCPaEC7NZCK/Pip0E1gfM+WR0Wq2R0zFBSUgWRUHsItS1s45pPvSmCmDWkzOXhJm2ZQQQgsRbZlJ48yZNE2bgqJWFjCO7dC/szdTO+XITzXNOPrnVTy6CeNtJ2p2YO3BO9fccWfzjOaOSKJyqyRdSc+m7fRt3oTRvx3XNnhkc47fvGFhaSEidVGijTGE7hHUDcRA3YIk9cpdP3dWCJC+/VZ4zCXxxvKkgyBx7azN8M4MxrDpkXHII6R0K0uj3SGs6aiqSkgPcdDSZbQ0NNNYW0dzfSONdQ3U19RSX1tHXTxBXaIWy7b582P3852fX0fW8JyMHYtqWXB4C4/8xIvDf/SkM7jpa1eVnOfgc07mxTdeQ1UFK76wgO2rhlj9YHfh3r509if5yr99nnCo3AxJZVJc9P1v8PO/3FUoW75wKf/18c8xkk4xMDzIwMgwv/zLnWzr7gTgyE8vQCBI9eV4+U87sLKVGyyhCmYf0krLHnUBm9XbVrBB/R8ScAwX23JQQyrCz8UcLU1HZ0UJKX11WHiEdT2VWPFt1zxhzaRJuj+NkTbZs97l3H1iNEcVtEQzsbZZTN1jLrH6RMV7kq6kf3s3kvYbp+197meFEG++w+0Y0N7Ogw1tf+K0zjW/+tWUedMjWlivWN9IZ+l8fSPJnRuxkr2MGC43PJ9mzYhKKBYl0VSDHtc9p1CJ7RkkqCyqudJLchH5Fyf8j8AnoVLiEPHjpb4TJG+rpnuzbPz7Ttwq1VNVKExpamFaWzvT2zqY2tpOR3MrHS1TaG9uo7WxmdaGJupr67n4B5eyYfsW/viD6hrdJXMXctyBR3Di5z7MSDpF59oR6juqs6EkkOo3WftoT6Hsqgu/xmc+8G+73acmVsONX72KaDjKj/9wGwANtfWcfMTxJfVWvvZigaiuBCNplZC0vibBlz76Kc447t1Mbe2gs2cX9z7xINfe8TM2dW5HOpJNj3djZmzalzUVrznv3cWTeF2vDDC4OYmZLibBRBrCNMxO0LCgHsV3ShZjuKUqtKV6JoyKQDheI57/BASgINASIWojOtmBDK+P5LjkkQwfXaxz1Kx+ktkkW1IjtC6YT/P09nFd60IRNM9oZ7i7//ytz107XUp5hhDiLYxSUIq3jahd6/9y4cD2+69qntWhua6LmR0/1DTU1Uvvps2YA9txrSwPbzH4zVoTSw8Rb44SqYuALnD8eKcbsENdFRwVpEYx1CIpeIwUfInp+yOcnENuwMAYMsgNGhjDJsaIiaIKmveop3XvJvCdR9uf7C4jaW2shjlTZ7C9u5P9l+zDWcedwvQpU5kxpYOOlnZ0vXKj9GaxfPHe/Pwb1/C+L50HwIanqldNX/nLLlzb+zS/8MHzxiVpHkIIrrroG2zZtZ37nnm0Yn075/LqPUWSHrf/Yfzs61czpbm1UGdGx3Q++f5z+Ph7P8S3fvp9rrztRgB2vNCPElZpXVRfIlmHdqTZ+ngXdq5cOucGDXYNGvSsHqRtn2bq59WSd91JZIn96gIo4Po9kBS8yF3e55D3RQsg2hwjFA+RGchw61qD53elOXcfSbPcSGc2yUjPTNrmzUIPh8Z9HtG6GiSpkzY+9d3Hs9md74tGp26v+BCrwNtC1G0v3XpVquepL9ZPacY2x5f40nXp3baTZOdW7GQXpu1yw3MpXugT6NEINc01qBHVk5ZKPjnBW5y8FFXB1iQI4T14X0VSAMd2yfTnMPpz5AZyOKZLti87ppfTcSTdrwygxXQaF9QhXElu2ARgz7kL+cFFlzJ/xhzamloRQnDqFz7G4fscyIdOOv3teGxV46TDj+OEA4/gb88+hlmFagmeV3Kk2xuk7eCl+/Lfn/7Pqs+nazq/uOxaln/kxIp11z/STXbIe2YnHnQkd155E7o2dsMVDoX49qf/k1nt0/n0lV8FYPvTPcSbIkSaIwAMb02x6eHOwvuKhSMcvuxAWhua2bRzKytXr8JyHBzDofPZbjK9WdoPbEVS6HtUkoxR8BT7WpknsSVqQHr7ffkREZWatgS5sMaa4SxffiTFp5ZF2Lejh5EtKYxUmta5s4nUjK/V6OEQ8Xp3+Zanrn/aSG4+LpyY/XrFB1kBb5moO1/79VfTA69+sbalwR+JbvdwbJe+bTvJ9mzDzfbTl3a46qkUXaZKuDZMrDEGmi9FFeFLT4GreJLTVcDOh2IApMSRIB3J0NoBsrvSGD7RxoOuaiyYMZvVm71xsVKdaRrm15V4OKc0tnD4vge/2cfytuO8936Ivz372IT3U4Tghxd/C7UKp0gQdYk6/ueSy/nhb342br2+TUkApra08fPLrt0tSYM477SP0NnXzX/f8iOkhE2PdrHw1Jk4OYctj3cVSPqBFadw9UXfpKm+sbBvd38PX7n+u/zyr78HYGjTCHpcp3FpY9HO9Yma6UwzvH4ICYQbI0Sao4QbIuiqQEpR6C7sW0mFJVwfRdVVMgNpfviiwftTkpMXCnK9G+m0TJpmTCdeP76TVFEVEk01Uzc+e+NDuaEth0bqZ22u+GDGwVsi6q41f/rU8K4nvlnTXFdRkjqWRf/2TszBHUgzyUtdFje8kCEnVCL1MUJ1EVwVT831U/w821QWJKmjgqMUW0E/HEffym7SO8cf/vVdBx/FB094L3vOW8S8GbOxLIvGY5cAnvQp5Ki+Q3HCIUdTX5NgKJWc0H6nHf0u9l645E2d87BlB3LDndXZ01de+DXqE3VVH/ur532BF19/lb8+/QjGiEn3S/3YOadgdnzkxPdx09evLktCaGtq5aavX83Bey7ns1d9Dcd16X2tn0hrlEhLtOD5zexK0/l4Z2G/TFfGWxEQSoSIt8ZpmteIqnhhvqBkRYIa06nRakn3p/jtOotNQynO378GBrfSZ5kYUzpINDcyLgTE6qLtm1+4+S8ylTpS1NT0jL/D7jGRLgUl6N380Pv7tz78o0giptimjW1au12MTJaezdsxB7aCleLJbQZXP5shp2hEG2vQa8O4isRVJE7hL1i4pAaz9K8foHNlJ30v92CnrULamQQcyy2QNKyHOGTPffnihz7B777zYzbd/TQLZ8wG4MRDjuasE97L4rkLCenldkbQc/hORDgU5oSDjprwfp8+85w3fc4nX1qJaVfuzXTg4n047Zh3T+jYiqJw41euIBGNA9CzeoCBjV430MZEHVdf9M1xM4X+7X0f5orPfsX7IaHr2W6kI3H9Bndo3dDYO0owR0wGNwyya1UXjgK24gmA/JL/FtEFseYa9HiIF/rgisdHMB0HN9XJcOd2Bnf1jPvd54WXFnL2eP3Zq+6VUlYXnB0Db0qiJvs277HpmWtujtXFFcca/0W6jsNQVy9OqhOcHM/vNPnJqiwipBFtjKNGNFwhkUKQH47HyBj0bRkkPZhBOqXkyXalaTt2BmpY9by4AcfP6cecxC2XXjPh+5F4GWfv3P79Hg5fdiB3PHBP1fXnTZ3JwXvv/6bP98iLT1dV75JzPl1d+t0otDW1csHpH+HK2270e/d4L+D80z5CXaJy/P3TZ32cPz12P4+uehYrZTG8eYTE7Fqk4/slgAXTZ/PQj3/Hs6+9yBMvreSJl1by0rrVWI5DujuNYdrouuadX/GcUYWcYglChWhjnOxghg1Jk+89PsKXj6gjlO0h3eulOEZra8a9TkURSDe136Znrr0ROHvCD4o3QVQpZWjN/V+/TQ/rcce2Gc+1IV1Jqm8AJ9ODcLKs3GFy3XNp0HyShtWC/enl4gpM02Lrqp1lBM3DyTkMruqh4YAp47rLJwxJoT/m23ZIKUmlU6SzGYbTSXoH+8es9+Pf/Zxdfd0Ylkk6m0HXND5z1seZM21WSb39l+wzofN/9N1n7JZAv/rLnfzojltYv20TTXUNvO/od/Gf536O+tqi+vrgyidoqmsY9xwLps/mXYceO6HrCuIzZ32cH/32VnJmMUpw9rvPrGpfIQRXX3Qp+599Eq6UDL0xSM2sWrK92cL3c8JBR9LS2MzJRxxfCDP94LYb+fL13wEg1ZsmMbUWTfHTESUoUnpd7PIZbQpE6qPkpGTDiMn3HhvhS0fUEc71kuoTuK5DqEImk6IppPo3fnTXuvsfal9w/K0TfU4TJuqWF35+qW0OLddCOo45fqwxMzyCk+lDOGnCQHQCAAAgAElEQVTW91tctzKFq6pE62MIXcURgJB+B38vAJrqTxce8uyO6Zxw0JEctfwQli/ai6MvOIMdPV1kO9PEujJE2uO8hRyEIvK5plWovht2bOb3D/6Z4XSK4eQIyUyKxbPmc/qKU0rqLfvgcbyxdRPOqFEqTjzoyLJj/uiOm9mwc2tJ2X1PPcLLdzxY4pzZY9Y8FCFwq1TRzzh2bHX0q9d/lytv+3HhdyqX5Zrf/Iw/Pno/9113O7M6ptM32M9L69dw7H6HjnuOc085a7edsu9/+mH+8PB96JrGB09475jSfUpzGx864VRuvue3AMztmMGc6bOquj+ApfMWcez+h/H3lY9jJS2M/lzRHgWOP/iosn2OP+jIAlGzvRli02v9nGFvFgE/yOppbBKE64V3wnVRXEeybtjimidHuOTIeoTZS6pfIS4b0SqE6VRNpWvNPT+Q6Z77RLy1q+qbZII2ampg49L+rU9fDFTUzbPJNFZmBMVNkbPh+mdTOIpCKBFBCalIIXGFzA+XgxSeXeoEmPeDL3yDH/7Ht3nfMScxo30al53/H4VtI6v7kY58W8xKzzyt7kC33PNbPvjVz3DBd77MJdddzrdvvpaHnn+yrN5wJlVG0olgY+c2Hl75RElZJByhval1N3uUYk7HdObNmFNWfvfDfykhaaQ+VOhts3nXdt7zhY+RyqR5fNWzVT2T9x39rjHLv3HDFZxy0bncfM8d3PiHX3HUBWfyn9d+e8xjnnvKBwrrey9YPObx1m/dyGvr14y5/+nHnFRYT3elyXZ7RA1pGoftc0BZ/cVzF9JS5zmCzN4sNhJbeL2rHAG2gOKoqL4gUbyySF0Uoau81u9yz9qMF+qxB8gMDWMZ5riccCwbhFu/7oXbfjDOIx0TEyLq1ud/9X2B0G3LZrzFMkyMVApNjiCE4Obnk/TmQIvoaFHdt0nzD6P4IBxkfiTKMfHBE9/H/ov2AsBKmqS3DL9t/p/RXbveLghVEG+r3ocw7YCWwvpTrzxftn1KU0tZ2Vg4YtlBZWWmaXLxNd8q/J5+UAtLzpzFkjNnE671pMEb2zZx2U++z6MvVLZP506dwexpM8vKf//gvXz3F/9TVn71r2/iht/dWla+/9JlzG6fBsCsjull26+/42aWfuBYlp99Eu/5/NnkjNJJvFYEtJTMzjTWiBeiW7ZgKbFoecxTCMEhey8HwLVczKRFyYgvAeGRH2+8sK4KIrURUAR3rc2yY8RBwQIrSS6VHpcXtmXjOi4j3WvPGti56pBxHm0ZqiZq/7Znj08PbDvesWwc09rtYpsWRjqDIlMowuXpbQZPbjcRqkKoJlLWUuXJmh+UbjyuKIrCDV/+Lro/o9jI2gHc3Ns3L+lE1OiGBfVV1dNjGrOPn1b1cRMzi46Jdds2lW2vZDPmcegYauZdD93L9p5dANROj9O8tAEpQY9rzF0xtSBZ/+fOX3DXw3+peI6xpNXQyBCfu+prhd9T9mthyn7FxuVrP76S7bt2lOwjhChI5ua60pCHbVtc9tOiALp/5eN855YfldTp7O0i7Hvy8yQFz/m2Oxy5b5EnVm+m4FDMS9MCYSl+n1J4010KTUGvCWMLwfVPj2BLgUYGO5fFyhnj8sMxLaSL2PnSH67c7cWNgaqJun3VH77uOE5FldfOGbh2Dl3kyFmSW15IgiLQ4yEvLorfXQkvhSswCJ0fFx2fLXsuWMzn3v9xAKTlMrJmYCL3OyakBCcw3GU1qJ9ffcywWpsSQI8W3QZ9Q+X3Fo1UJ52XL96rrOw39/+xsN62V2Mhz9mVEKoL0bG/RyjLsenZjeMriP0Xlzu3brjzF/T6192woI6GPeqp36OepiVeA5PKZvj2z8o98+865GjAy14Koquvl6F0aez4x3f9AsM0kFLyw1/9hGMueD+GVZ7octiy8oYkj6OWF5NZzP4srgQrqOXhC48CSYPbPO1Q0VW2jjjc+3oaIUATaaxstjJHTJP08I5DBre9cPhuL3AUqiJqsn/domyy6xDb8ObBHG+xLRNdySEEPLQxy4jptUBKSCsQUfo36/q/vXWJTXVc+fK5ny1IFqM3U6F2dZB+llP19f8xdd3AG7HGiGFqVWQYaarK/FH2qWmaPPbiM4An5aOtEZwAUV2gcY86GuZV1y0RYMmcBSW/pZT88t7feT8ENC1tLKTyNS9tRPU7sv/m739icKQ0zrn/kmXoqoozaopGVS3/RIdSSe5+6C+c+R/n8aXrLsfyZ3vX68OosXwne8FBS5eX7Dc4XOzqt2jOgoKdag3kCvHXIkEBIQtJNS7FhJj8kFB6NARCcM/aDDlboikWSI8D4/LEt1e7Nz310WqeM1RJ1L5Nz53lWLawTauiDo500FQbF8F9b6RBeK2PJz9lQaKSVzGk9xBcPBu1mghJbU2CS87+VLX3WAUmbpxOZIa4ifiUskbxuGOl/dlO5VzfOR3Ty5I6Vq5eRca37SJT44xYMGJKkv6SMiVpC5oOamX6STOqutaFs+aV/H5l3Ro2dno56PEpMdSoVkhOcVWFunmeFpIzTf7wUKlqHY1EWTR7PsOp0gyztqZWprVMKTv3OZddxD1PPuj9EJBY1EjjIe04WY+0+8xfTENd0TzJGTluC3TfUxSFEw72bFtpuTiDBkhv7lkX75r9HnEFihaEC56AUTQVoSmkLcnDm7IIIdBVA6cCR2zLxsoZDO18+TQpZVU9Oqoi6sC2F08yc0ZFaSodB121EELwyi6T7rSDUBUUXS3eYIGsAdIWtgW6LFXA+aefzfTW9iprjw8pxYSdSdVWlRKydvUHzga6dDXWltvB2VzlnlOzOsqJ9tzq4tA+4dYoritx8/OkOhLbkViOxHBAxipH7RpqaktycAEeeeGpwnq8PVaQ1tLv5R20v//61MNlx1w0ez7bukrtV0VR+Np5ny+rmzcnlJBK86Ed1Cyox+rPFV7MsfsfVlL/2Ve9hIcgTgrEf82eDI70tTq8GQyOXXQwn17xUd6zfAXRcMQXNb7IkR5Z1bCOFPDopqw3ZI3mAG5lzdM0sYxc08DmZ8rjdWOgIlGllPH0cNcyK+u1FOMtUkpCuoMQgme2eheu6kWp4AZutDAJEXn1qzjkRjWIhMN8/bwvVFe5ImTZyHqVUG1dCZgT0KmtoaKtNau93Ak1kByueIyO5raysrVbihNz6/WhwggJ+QT2wogJ+aUCprWVN5Kr3nitsC5rw+QsF9N2sRyvQVAToYL6u/K1VWX7z+6YwdrN5ROIn/OeD/CFD55XVq5GVFqOmkaoMYKQYPYVG7Ejl5d6vZ98+TleDFwfwDEHHIbqx4CtvkyhQWmI1XP7v32fRe1zeXHLa8TCUW7+9PdZ0DGnjKyq7k36s2XApD/jogiBqviTQFfgi22YDHStPWacx1xARaL2bXl+f9eyNdsaX+11bAehSFRVgFBYtdNTs4SmFnT/QrzSJ2ZerSg4l2SVX4mPD590Ost2E3ebKKQ/E3e1yJjV1c2ToFr0PV2Mgx+8135l2zt7K8fJWxqbyso279zmrQhQ43qBkFL69+6v56VgJbSP0Ri8sWVDYV3EdUxbkrUkGUuSMiRpQ6LWeSp512AfPaOGfZnW2s7L69cwPEZj9N3PfZU/X30rCwO2t5NzGHqpF8d0cCTkej2ihnWdQ0d5pB9b9QzbujvZ2b2rUNZQW8+h/jN2RkzI2iDhK8f/O1fcdxOnLDuOjxz6Pg5ZsJwLbvwvLn7v+eT7vebJCgJFU5DAy505hFDQNG9r5TCmQbJ7XVVdtCoSNT28fUk+WDuuNHVdVMUFRdCfcRjION6AYYriqSkBDrp+B9LCzGL+4sjxVd+d3Z04ARtNVVUun0A/y91BSrClZAJjjlVvo05UpfYvYkpjCyceUtrYpjNpdvVV7jjeUFPuEOrq9/ZTwypSeKq+65aSdCISdawwUX7UB6EKCCn+8fKBSK9xVmJFk6zQePhobWjCchzueezvY55zxcFH8fxtf+PLZ38KxR/oyujJMPBsF07WxvZDMwcsXkbcT/YHz5H2zKsvApSpv+8+7Lhivd4sEkFduIY1XRvJGlm+c88NLOiYTcbIsmbnBhZ0zB6ljUgU1ZOq63pNUASa6j3ASpyxcibJ/m1LKz/tKohqDvdMr6RvO5aFlBJF8VKtdo34dlZ+fBSK2T95iRr80N0AYcf7qDfs2MLtf72rpOyYAw7nwDHCBBOBIyFrSnITYuoETlCh7vS2duZ2zGDu1BnMmzqT5QuX8pvL/4doJFJSb+3mdQHf4+4xVghn0JdSSkgtIWPJRzcBiVozKpFASlk8R1gFKbwRkf13nvcBKKGiKdQz0Fd6zJhHrpvuvn235w3pOt/85Je495qfU1/jjWVkDRoMPVOUlKPjp6veeJWsn0v8zKsvlGzLh4UA7L4MmlAxHAtXSjoa2vjxOd/iN0/eQ9rMkcymiUdifs8t/5+UhZzzXSM2QkDeB1iNnYrrNFXTq6YiUV3XabRNT7Udb5Gu61+vwog/Lq3/ngoELZI0oHK5slAHWbkHyzd/enVZZsqFY9gvE0HeNplI75kJ8bRC5fuu/w1r7nqMNXc+xuo7H+WpW/88Zl7sytXVjfU81sBlBSeUKoohmcB7Kb6f6lSA0Ki8VsMwcPwZoYSq+OGuIkELjUNgcPBMttQxFvXJ//RrL/JYhcyoYw44nL9e+6tCg2Gniv2hjxhF1KdfKZJzdLbXwtnzmeE7JZ2BHIZpkgjH0BWdLT3bOfcnl3Dmwe9GU1T2mbWItds3FBqf/Lec7/cwnHMAxZtKU8qKnLEMC9eVgmx/xSyWKogqdcceX4Q7lo3regNbCEX4k91SlJx5jxH+b7f4URT6gVapcm3v6eKHt/+0pOzUo09k0ahQwUThSnD+UcHRibB6HPy9yhEexBgzRuWnsBT5IQ3ywdOgrVo9T8vOMTr+KUu+gaJGVbLPqLiVGkju//z3v04qkx73GvZdtBe3fL00bTashzhor9L46RMvPVtYf2XD62Ux3OMOPMJbcSVOf5abn/4jV51+Mbc9/Sd2DvZwxZ9+wmXv/wIvbniNVDbj31TRdMvfn+N6g5yhKJ5H3XYq8MZCui45oVYM0VTh9XUN6boVWwfX9lxDXixJ8fctUea9G3O9lrzY58+XZq70pWvlr+SKX95AfyBrR1M1vvG2eYCrw8Q8xG+dqcPJYR4YlaS/OzjOWIkS3rcw2iYts02rbDBHnyMYty1qSaXfgKdFFQ8e0krDQGZgKJ/Vm9fz/ks+QaZCOOo9R53ASQH1ddmCJSWqv+u6PPlyUYq60uXJUXbqCYEeNk5PhvvXPM11D/2aFUsO5bef+SEfOuQUHln9LD++73ZPyLilQib/W1NFsVuh9L2+4/HGcUBKIq5VcdKpikRVlFA/QlR2NVu2N6SJUKiPaYB3A47lFAmYT9MrfBx5gnqODdzq1M9UNsNPfn9bSdmpR5/IHjPnVt55N3Cr/EDfFN6G4/7h4b9iVjnzenaUaQCQiHsxTNdyC+8jv7jBxZVVNULGqPGxdF0n6pNV2sXWIN8W50fkkAE/QN2ooVsyoyTog88/yXEXnMn6rePPJ3z+acUEn/2X7F2ybd3WjWUhrSdffq7k91HLDy5Ic2cgi5SS57eu5fxbvsFZP/wc51z3Je578VHEaPPNJ61teo1WQ1QDoSClwKkiPIME13UlsZZBKqAiUWN1rVtUVa2sb+dMLNNFCMGMpqITxDFtbMPGtR2k45ZITxyPpDgS6bi4tqw6RHLdb28hGcgBVRSVT575sar2LYNP0olIyYkIybfaZ9ayba759U1V109ny9Mqm/wsHddwAtLOG+SLkoWqGpbR6iNAm9+zxzW8xjlvn+YPJyW42aIknjoq42hwjLDMC2+8xr4fOZEvX/tthsY4J8CxBxxecCwdtGep2jtaegI8+sIzJb/ra+s50rdrpe1nKdne9+g60jPrXOlNSuULFGm7uJb33efJO70xhBAC25bYhlmRM4qqItRQZzXTOFYkak3jjFdC0bDXQoxzUiOdw8jZnns7qtFRFyq8IddxC4S1shZWzsLJWtiGjZ2zvRdrOkjL8aRyFegbHuS6O24uKasdIyyRx2iVumTSJq/CxIZieTu9SRXwvVt+xFo/RqnVjj+uLEDfUHlC/bS2Du9SbBdpumVOvqJUrU5VH6vDwOypxYwoO1MkZFCiOr7TR1MU5ozqIpcPIQElYRzTtvjBr29ijzOO5Bf33FF2Xl3XOWxvL246Or938ZwF/OLSa7j7yp/x6I138tKv7ucPV5U3eqcF+rTa/Rlcy8E1bBzDxjEc7JyNmfO+XTtnYRsWrmWX+FcWTYmBEJg5ByNrVCSqHgkRq5v2yljPdzQqErVx1vKXXKRRUx8fX6KaFkbGxDK9zKR9Z9QU7c+CRzfvWKLwV/hvUUhQ3YmNW3TtHTeTTI8/+mAe1ihVLaSHC/N5SNdLyA92WlfHGLWgZI6UKq8xf7tvFrfc/Wu+fcu13g8B8cXlyQyj0TNQTtR5gWFdrKQ5to0acC5VQmdvd1nZkjkLC+tO0gykEPrHtGWBqHvMmkckXBp+2t5dHDXQzZSr+YPJYf798kv46V2/LNu2aPZ8pja3MW1KR0n5wXvvz1knvJd3HXYsB+21H4vmLKBtjGSNkw9fUbAv7ZGcN6qD9CeecvN+FP/7DD4n/7tWBOwzw5u6MZexySWzFYjqUlNfQ33HHs+WXcwYqEhUIYSRaJi5snl6M1J6Y/PubskmM2SSFkJROGJh/aiX76m1okBcfyncvPdWlQkQdWBkmJ/+vvyljYWRTCmhNU2j1rfbpOF4dkfAfqqJl883EuzNUvXwSlV8+Pc9+SB/eOgv3PvY/SXlruvy2au+Wmgg4ouaUBKVc7h39u4qK1syt0gie9AY06HkvabqRs3Y3lOafAKw/+KifWj7Se6Fdy8lZn+2YAeM1Zd1444tuz2fqCne96U/vRp7VM+iKU0tHLp3eSZXtWhvmcIBi7zrd3M2GI5H0Pz36zDGw6KwfVF7jPq4jpSQSRpkkplxudIwpQFVU2masc8D1VxfVUn5TXP3+zNCYe6yOSjK7u3V1ECSkX7PGF/UHmNWU6Tg7SXYGvmtVHBRHK/1mqjj5erbf0q6ghsfYGdP+cc715cyMmPhOi5uutiKzxjVMgMMpbzhLIU6sUHQKn34X/zBZXzgK5/itEs+QS5XdAQpisKMKVO9c2oKkTm1VT2fjTu2lpUdulcxLmv2Zks+Ouk3otKVOFmb7IaKvg1M22bbqA7gxxxweDF3tjsTUKm9U1k7ij6FU488oeyYr27wBpRvqW/kix/+BB8LzEigTq9FafFipn3Dg2WkjoQjHD7GqBYTwZmBca+soZwvQSXCkWXaoHBLW7kVixsQApKDOdKDacbLPWhoa6RjfitSRDpb5uxX1VCPVRF15tIj7jDSlhur1Vl65BLaZk0DKTxDO7Dk0gapwTQjAzmv1/6+zQWpWYilBiRpUJoKKVH8vxNB79BASfel3WHd1vLREg5cusxbkeD2ZXEGiiRZtrA8s6swiqCuTsDslJWZGsDASClJFvqebGm7OIZTlf3YNdBX0vcSYN7MOcz07VSzN4tjuSWqqQScnM3w451kN1RO/AdYMyqBvrWxuTAYmpu2sPNTiUgvl9b2xzKa3T6No0YNmtbZs4tEvIZbv341m/70DJd/5r8447gicdz+bMnXqiqlXQBzRo4j9n1rRD3j2JNRfPXXHMmWxpoLUQnp5wFQiGI0xXWOXFiPlILBnjQjfcNl3HAdSSQeZ/5+i5i1VwdG1qZ19v6/FUJUZRlVRdRow5ytieZZfzMyNkKYTFvYyIGnHsLexx7AHofsy9x9lzJ7n8XM228vmqZNY6AriURw1KJG2utChZsr2KV5FTiv7rpFW6BaG1XWF+2bn/zhtorx11c2rC0Lyp9y+IrCurN5CKfTU481ReWYUd2kLMtiV5830LmITISoE7NRu0el1S2eXeyc7YxUnq4jj7x0CuJd+dxhV2J2lmohUkJ2dT/SrH6e11c3rC0r+8RpHyms594YLDbiq4v3deEHzisbufCxF5/hA8efygffdVohJnvk8oNp8rv6uT0ZXJ/o9fFE2dhKruOwcNbY4bmR1Agvvf4qv73/j3zrp1dz9tc+y0EfO4kHRyWQtLe0cbDvNbYNG9d0PGka0Pyk/x0XJKoLHz54CiFdZbg/g6JFmLnnYuYsW8LsfZYwf/+9WXLEfux30iHsfcxSEo0Krm1jpC3ZsedRv6jqQTOBoVgWH3PeZdmk6Xoqko2VHUTX09TUmjR16LTNiNM8NUJtk4qqKfTtHEHXFD63Yoaf80kxkTTQQuWHGRCOR9hqv2o3riPrvFS51zat429PPTRu/ZFMmtfWl35YR+9/GEf4tpLM2OB/pGccexLNDaVOm/XbNmH7RBdRfWJJDBOouiPgUAE4IDCWb27LCKkXqpsV4bkx0g3PPrk4Xm5uw5AnVf0YtrF1BNMfZnN6a3thELnxkE90D+LdR6woPFM3aZJ7rovc8124I8XJt85734fL9vvz4w+wq6/UQRUOhbns/IvL6l704U+gjUqWaKpvKMuWOvXzZ9Nxwj60rNiLA889hY9+40K+ffO13PHAPaxat4Y/PPzXsmN/8IT3FtYNX6oWSZkP0fiEdSV7T0+wYmkTtuXSt3OYRGOIxvYQrTPitE6PUN8iicay4A5j5ZIgJbm0TaJt4X0ts/Yv7+u3G1RN1KbZy5+pn7rn77IpCyndwOLgWDksI4WVS2LlktTUhxjsTpJLW+w9M8EZ+7UWDPO8FBX+TedvXLgBW6BKOFOL4Zjv3np9xfp/e/qR0ptXFH59+Q0sD6i5czpmcMXnvsZoPLem+OGLGn1C5HMnIFI3d5bO0nfk8kMKw69Y3RmcoYohN8Dr1jUayxfvzSl+bxE3a5N5rtvLb90wRHZN0VN8zRe/ySmj5kQdC0++vBJrVBKGIhRuufSawjAnzrCBM+xdcyIa59ZLf1g2TWUqk+beJx8c0zw577SPcMMll7PX3D04eOm+3Pjl7/Klcz5TUsd13TJVuGegl/uefYz+3cReAe55/O9+6msRZxx3MrrqNQK5dC7wvRa/1fzveEjl4pNmoiiC7m2DRGIaArPAA9vM4DqlfHEdl8yIaS8++tz/GOOSdosJDRe67N1f/FI27aSdfHbLbhYhINEYpnNjH0jB2YdNZX5bzFeBCSxFwhYeQIAAr214fczgPeDZlYkQMu699Kdfe5GVY7TwQfx+jJH1mhuaeOymu/n9FT/ltst+xPO//CttzeVj5z76YvHDF3XhtxRyGQ+bRjmC6mvrOG6UGl7NuElPvvwc5hgDfl1z8WWF5Ad7MEfq2V3k1g8WGp7Pvf9cTj7ieI6swt4byaR5clV5QsG0tg7u+cGtzAmop3vOWcgDN9zB0nl7lNW/++G/kjFyrFr3WhlxAD7+3g/x3G338chPf885p36gbPT/V9atZu702SVlzwa+BRnTcdpqcGbWIxc0Ieo8s6lroI8X175csp9hGszz47uO7SJtt+T7LNqtkguOnk5zIkxyIEt6OEssERqXF9KVZFMWbYuO/HHjjH1Wj/90SzEhokYbO7bNP/TDX0wPW6PyeMuXcERFCJedG3rQVIX/es9cGmJ6iW1akKYBO0ALDGb11Ruvom3FXhz28ffwxasv5cGVjxe25XOFnY5iGOWKMcaSDWLVujU8OsZg2Zqm8e7DV3DmilOIx+Jl23NGjr884Y/PoyvICUhUKUvjs5WwevO6srKv//sXCkOkNtXV8/0LyyX+aCSzmbIBvMEj0X0/ur2EROAls3/r/Iv5nn/s5Yv3pn6MENVo3PbXsR15yxbtxWu/fZjnf/FXXvrV/Tx3233sM4aDTkrJdb+9BYDB5AhPjUrvqwZ3PXhv2bGD/U6dmXW4M+tQW2KE4mG0+mIu8M/++Btu+eOvOe+yi1h65lHMPOVA1vopi4oQXrjQLX6zea3wtP2msGLPZnJpk871PdQ1RSg4Dnez2KaD48Y37fe+C/5rovc44Skt9jjyYzc++pMLTs6lN50ciY3fstfUhxnsSdO1uY/2uS1c/v6F/Mftr5M07fzk4AjpzxTt94kLh0OEIyGMnCcNLMfmubWv8Nza0gQOVVOQjsSpjyDDKsJw+PMTD/DG5vUsnD1/t9d08TXf4ulb/1xm44yHPz/+dwbzoZmmKBIxIWfSROq+4o8GH5Qayxfvwx+vupl7n3iQT575MaY0tXDRDy6reKzf3P9HTji0fKSPveYv5oVf3c+dD9zD2k3raWls4vRj3s3MAHl1TefIfQ8iXSEp/ncP3sv3PvfVsvGTAFRVY8/5i8bd/5HnnmTVuqJw+ekffsVh44zHOxq7ertZ9cZrZep0MJ9XxEKEHInmeGFAJR7C8j/Am++5g5vHyHYCqEvER0lTj6Qn7tXCvx8zHdOw2PzqDhINYVRNjOvQlK5kZMCQy0/94ieEaJ7Y3Jm8yWkX9z/9KxfkMmqvZXj9UHe3IF3qmiMMdg3S3znEnNYYl5+1kLiulmZ8OJ5TKS9V6xoT1DfXEk1ES8ZcykOEVEK1ESK2RHdANntSUALX/PomXHf3nstXNr7OFbdeV/W9Sim5/re3FgtaYhPOCJxI9aFUsmRIkzyOPfAIrv7iN5k/Yw6JeII9duPhDOLuR/+228ytWCTK2Se/n+987itc9JELSkiax5HLK48SkjMNfjJGplC1uCowvQbAnQ/eyxtjjJs0FqSUfPaKr5SNhpjNZXlp3RrvR0wn7IJuS1QHNFeiSUG4fuxZw0MhnURNlJbGOiK6HpCm3vd67JJmLjxxNtKVbHllJ/GERiisjMsD6bokh0zaFx975dS9Vjw48af0Jokaa5q+c5/3XPT+4QHDdB23JGd09CKAhtYoXRt7GOweYWFHgsvOWIoKe/AAAB0jSURBVEhEUwrELLi7HTw12JGEdZ1EbYzGKQ00Tm+iprWWSH2MSEuC+KwmVClQHUnYlugBVebme+6g/YR9OOXCj/LNG69iOD/xb8Cs+dbN1/LHMTx+Y+G3f7ubp/KjAkQ1ZH2k4KyuFhMZWhTgkeefqlhnv0V7V6yTMXLcOYFpGkejGqIC/PCOmxn2NY6J4P6nH+GB53z13H8/tutwwXcuGXNM49G49MdXcs8TD7DvHktxHIfXN63j5/fcwfn//aXCWL9qLITq+CT1/yqOJN5YQ01zgnA8TLw2SkNzLa1TGmlsSFATjaAJpYykxyxp5uKT5yJdycZV21A1l3BMG/f7l1KSTdlE6ub+db/TvjJhlTePNz2R8fQ9Vzyy1wkXfnC437DyM3bvbhEC6lsj7Hyjk+4tvew1q45rzl7K1PpIwdtb9PxSKNM0DeFKVCmIRELE6uNEExE0F//he4uuKKgtxaEoh1JJ7l/5OJffeh1dflzSTYRxpnleYle6fPhrn+Und/1yXBI98OxjfPJ7xWfrzmvwBmcuJMhWhmRiqi/AHx/9W8U6hWSNCrj2Nz8rS/WrFnOmzizrMzoWBpPD/PdNP5zQsTt7ujj/v79U+C33aAbfMfjUqy/yiW99EcMc28M9ODzEuZd+vjC/zXduuY7mY5ew94eP5xOXX1Iyh6yWiKDn1V7bW1RbojiSaCxMXUOCRG2ckKZ54UFH+gP65r9LbxrGsw6eypdOmY9t2Kx7bhOqYhNP6ON+90iJkXFAb3vmmE/+5EwhxJt7EbwFogLMPfi038875Jzzh/ty0nHcwlixYy15svZt72XrazuY0xbn+n/bm4PmNgZCNfmYKuBK3KxFOBwiFNJQfFIq/qLaEs0GzX/wodYaQjMaUOujiFCpuix1BWdWHc7UBG6zp/JYjs1nr/oa7/rMh3j0+adKvI1DyWG+dv13ec9F5xRsNDmtFlmXT4mcqESd2HN95MWny+Kpo3Hg0n2rOtaaLRv42ThjEI2Hb930g8ozjvvplNf9v/bOPEqOq77333tvLb0vMz27ZjSjXbJGsS1v2NYDCwwxx2HnQR4QiHF4Dod3Aic+8AKBl0P+eA4JOaxJjknACQkmDknAjs3DLLYxRraQJQtGiyXNSLOvPb1Mr7Xd98etqq7u2Xokb4L6ntNTS9+uqa6uT/1+93fv/d1/+waeeHZ9TwAQzTFv//idmEqLNmHeEYbZEoSxvcW1rN969Hu47n234V8e+XfMLsyhWq3i5PDz+Iv7voLBdx/Et37wXfd4ZycuuMnFXRECtTMKJSALMA3nwW65XhsDQSCogoIIA2E2GA0LCEkU/+ftu3Dnwc0o50s4fegsAkEgEJbXvN8ti6NSMqDp4VM3fvCvfocQsn4/1zV0UTOOe3XFrXd84+iDX4yMHvm3L8RaFUrX6AZLAMRTKpYWczjzCw3brh7AZ9+1G994fAz3PzUOzgkItZMw2lFdfakCqkoIRkPQKhoMwwDn4n2RKULM+kw5QMMqWFSFRQksyxJD6cBhJAIQM9UCxpYEJEZAZ8V1e+zoITx29BA6kq3YPbAdFa2K42dOusmwAIC3BGH0xURYntjTZ26kHXWDoFqc4+vfux+f+dAfr1pmR/9WyE000wDAp//uc7jtpoPotfsNN6OfHXsGX/z2P+CW/WtPOka2JMHPLsK0LLz7kx/GD79yP/auEUDKF5bwtrvvcHPs8oAEo98ewBFSYO5MgT2/AHDg9NgI7vjz1a8BqP1jmBwkIIEGZNCQDCkggymSuCcMT/dUx1sDoAZVEIuLroKmpwXC7ZfO0RFT8Wfv3I3tnWGkpzIYOzGGeKsKSaZYb/qDStmCYUSHDv7BF28NR7sX1izchC7Jojq6+k1/9OW9v/2xd+UX9KJprOMGc45YUgGxqhj66Unk5vL44MF+/OV7B9GbrLnCxK4IElOMZqguFiFRilA0DFmSai6MwcEMy31iSob9AoEcVqFGAwhwAmY4vaIIjM0JGDtawQO159RsJo3Hjz6Np4eO1SAlgNkThbGjxdl0LaoXvvHZKfxi6Bim5qZhNKZB4c2N73RlP+m+8sB9mF9c/ff9x4cegL6WS0sJ6CbRvJItLOEdH/8D5Jaaq0eOTIzidz/1YTdZ2VrinWGgU1Q7FvNZ3HLXO/H1735r2XXgnOOxw0/iwJ1vwZNORFaisHambKsssvqZyQD0fR3g0TXG3RIArSFgTzvYYCeUwU4EtrdB7YlDjYcgyxIkE64FZQYHMTgYB4IhFaFIEGZRg5Yrgxj1VhQWwDjwlmu68bX/eTUGUkEMH7uA8ZNjSKZUSBJZ8/4G5ygtGZBCW75/+4f/6UC4fWBDExavpku2qI623/j270ye/unUoX/+9EPRGG+RlLWfAWqIQVYozj83jGxXK67ctxlfu2s/7v3Refzn4cmadeW1UTd6vgLCqpCjQQSSAVRLVehiGjsQCnDKYVECYgGUApa9TQmHRAlMChj2ZLVWXIU12A6arYAulkGWNBBN5CLmAQlWMgirMwyu2peIi1vJsaiQqYDK4vjBMz/FD+x+o4xSdLa0YTZjQ0aJ8BDs771ULGBiZhKpRCsCDelAAYB0RcAnl5ArLuGTX/m/+NpnPr+szPnJMXzqb+7Bm17922teYz6QADIVoKjjubMn8da778B/fv7riK8xwH5idgq/87H3NzWbG2AnhNuWANVNkHQZ+VIBf/gXn8Rf/8u9eOstt6Er1Y6Z9Bz+68kf4YQnmssVBmN3Skyf4X2OcYAHZehXtIEsaaCZCkhZFxBJDAjJYIkgGCWuxaR2MJK6/ca5ZzwpByMEajgAiTFUc2VoFb3WS46jzoq2R1V84i07cWV/AkuLBQw9ew6qCiTaRHfVNR+6HCjkDLT0verem3//c3/YbIf7ZrSx8VpNKDd+Ytvj9/3JfzCyOBgMr++acQ4U8xoMk2Hb1VsRS0Vx/EIOX3j4LEYXiuBEkMEdN4cScCqGfamxEGhAQrVchVbRRBdi+31OiJhvlRIxpSMV25a936QEhjuTNKmZS5dE5wo1XCLPJpvIg42vbaWs3hisvhikp6fsuR1rCqsBpBItmE7Pi3xIBDCv6wY7Mu1Wgv/szo/hE7//v9xO7GdGh/HWu+/AuYlRvPnVb8A9H/kkFEkCoxSUUtz+0ffjl8OnxUPk5l6Qkg5+bMY93kB3Lz7/R5/BGw+8rq6t1rRMfOeHD+GPv/BZd9pEAOhItuLqXYPIFZaQyWeRzmexkM3A4iLZuvmqHnCIBxYdybhVijV/87gKfVsL4OQYrnvTs8Ou/lDOwSyIICK3YeS1wRzU4qC8FudwhqdJjCEQVsEoQzVfhlGq2oCi1nfX7tAgEYK3Xd+DD9zSD5URjJ4Yx/zoLBKtKtYzOgBgmRzZtGYOXPuOP73mbXffs+4HNqgXHFQA4JyHHv/aR7+aHT/8gWhCEp0Z1pGuW8ilq0j1daB/cDM4IfjXp8bxT09cQNW0BDBeqDzAKrEQpJACraJBq1RhmlY9qPbnvACLWc5taImwtiaB+D/O6Tae9grQ0mwFJF8FqZogVXvAsS5cUt4RgdmfAKcEbCwHOrGO65kKwdzVCjpfAnm+ZtF29m3BzVdeh9n0HB595snmkpwpDOb1YlgbyVdBTywARu1BsX3TZhy46gYkY3Gksxk8cfQQzjeML11PvC0EY3v94AWaqYCO50AKy7sv8oAkAnptIdRd3BXgFBk/hLsqWcJqUtdKOnB6R2LZ+zmgqDKUoAIKYgOqeQaBe5oD7eW+zQl89PYdGGgPIb+whHNHzomoblxu+t4tFtjc/nd+6nf7f+v1a48OuUi9KKA6Ov3EP/+PE4/e+6Vg2GyVleb+VblgoFoBenZuQtfWLiyWdDzw1BgeOjKFkm4uA5ZTsU2YmAVaDot+uFpFg17VYXLLhdSixM7hZW87MNvHMW14TQKY9v46ONcD1y3DbeNM3H2EA3ShJKDWLQGN/SIArGQAZn8CYFQ8AGaLYMOLG+st4RHfmoTVVWuyIlUD5GwGJLs8Q2GjrFQIvDsKej4DsqTVvhejgETBJQoeV2FtioHbUV/u/rGLVwyQggZicnBGwEMyeFASB2p0HxssJ7MhdV1aG1xiu7au9XSXgCwzKKoCWZFhVHXohQrMsm7DiBUB3dUTw3v/22bcuCuFUq6I0aExFBeziCYVMGn9+5VzoLhkItS6678OvPezd4VaeyfX/dBF6kUFFQAKsyMdP7v/s18tLZx6ezgmLetQvZI45yjmdZimhC1XbkFrbwr5ko5vPn4e3zs8Cd0S8C2zsAQABVhAhhINggVlGLrhQmtxXucK16xsvaX1rps2uE6Zere44cRX+24r7V6Lf3sPKWqgozmQXG06QSgMVkcEPCSB5qpwE5w7S0rAUyFYieX1X4CDZqugMwUBrDciRgl4MgCrKworpsIJ7xCDuw/EuvQzKz1AVnuorAImWQFOYtcZqQ0YaXB1YcNJOSBJDEpAhqyKMc9aoQq9UKl1pHeui5Obywa0vz2MO1+3FTfvboNW1jDy3AgyU/OIJhXIanORdF2zUFxCevANd31k9y2/9+2mPnQJetFBdXTiR/e9Z+jRe78UivAWNdDcvzVNjqWMDkkNon9fP1o3pTCfr+KBn43iwV9MomqYy+uwNnwgwi2WIwHIYRVEotA1A3pVg141xOTJnhtwGbQENVfZBtW0IW8aXGB1eFcrv8J7xOQi0MUIuMxemF/NElYPpiWspMrENXS0liVf870VoLSXDpiUw4bTsZaeRGK8wWK67q14T5KYcG1VBZQSGGVhPY2y7qlzwtPKABfQrZ1RvP+WARzY0wZDMzA2NIqZkSlEYhLW67fuXjYLKOZNBJPbH37NHffcFWrdtLH6wkXqJQMVAHhuvOXQQ3//iclfff8j4SgNSXJzrUOmYaGY10GVIDbt7kN7fzvyFROPHJnEI89OYTxdCzrBC5DXyioSpJAKKaSAyNTOnGhA13QYuimmf/eAzokD8HJwnbKciPqt5dle5i4Dq1/lJryLl/YXsrWeu71a5LMBSscyMm63czeC6bGaTlu4m+XDhpUxClmWICsSJEUChYDTKFVhlHWRK9pJ6dPg3oJzKIzi5t3tuP3aHuzf2oJyvoSJ0+NIj88iEKQIhFjTXl6pYIKqnYf33XbXpweueeOj637oBdTLcRsgO/P8wOFv/9VfZiePvi0clwhrMlmYxYFSXoeuE2za1YdNu3shKTIOn1nAd54awzNnF0RrnGNlbfcY7jYAClBZghRSIIUUUEUS7Xe6AV1z5q40XRfYsc6N4Nbnra5tC2hr8FrEvn8brS+w/tVvBuQXQ+s0QXjXCQcIaqAxxyI64DnQufB6XNuGphHCxdAyWZFsOGVQSsAtwChrMEoajLLmZgmpq3u6VQCx3hpR8dYb+vDmGzYhHlKQm8vg/PELWFpIIxyXoTbp4nIA1ZIFzQhM7zl4x//ee+sHmk6f8kLqZboThCaO/+T6ow//3Z9Xc8O3hqISVkilu6I4B8pFA5USR1tfB/r29iOSjGAmW8H3j0zg4SOTmM2VV7ayXmgJQGUGFlQgBWWwgCzeA4ehmy60hm6KiZg9LvYyWFE7rmNV3cTzDQA7+2rv2z/DOnXZF1185XUvjG4vMDQCZ19eF5waiI2QeuFljEKSGSRZwEkZFb3OdEvAWdFhVvQV4awHlIOC4IYdKbzp+l7csKsNxLIwfW4KE6fHoZdLiMRlSHLzF1SrWigXSHbrDe/83DXvuPtLl9oN8FL0soLqaOz4YzcPPfr1jy/NDr0xFJWY1ETEDRC/j65ZKC0ZUCNRdAx0oXNLJ+SQiuMjGTx5YhZPDM1gLl9ZBVq4QDmuMlMlMFVAyxTmdlNzZgow7JSPhmnBcoJaq8Aqgi/EA2/Nunphhb1uoR5u5zs6+wDPMRp/utUu2TLjyN3AtPO13XW7LMVyOL3lYI+Kcut/WAlQ7z4xvpYxCsYYJImCSQySJNxOB0yzqsOsGDCrOizddI9XFyzz1js5ByUEV21pwWsGO3Hgig60RBQsTqYxMzyNxak5yApHMLQBIwCgUrJgGOrk5mvf8rfX3fqhvyXx+PJpAV5ivSJAdTQ3fmLbc9/76qfmzx16TzhKZUVtvocj5xyVkolywUQklUTPzl60D3SCSgxDFzJ4/JczePxX05jLVWr1SG+dcgVrC0JAFWaDK4EpEojE3DvagjMHpgXTdJYNAAO1hwOWw+nd736XZes1i9vIXTOJwBszO7of4d51Xh8X4/VlXCvo7GsA1As+ZVRAKTFhMSXmWko3M4fmTBdhwKzYdU2gvr7p/q96CypRiv1bW/HqwU4c2NuBZETFUjqPqTOTmB2eBCE6QhEJzcZAAMCyOMpFCyaPDu8++L579r3hg/cRQtYfa/cS6RUFqqPFyXO9p37yzQ9fOPrwhwIBq0UN0g1V10xTjAHUqkBLTzu6t29Cqq8NhFKcGMviqZOz+PmpOQxP55dZ2Do3dBm4AGEMTJVAFQlMYaCKBMKoe2dzIh4apikSWTngWiaHadkQOxB4oHWsbB2MnvUakMvd5NVqlCt60stI99hnj+V0LwG3d/DaZykloJSCMmdJXWtJKamDGRywdFOAqZmwNAOmZtSahqz6/9FoNcU5c4QUCdftaMNNezpw0552xEIKSrkiZoanMH1uEnqpgGBEghrYWFTcNDhKeYMryS2PXXHLu7+84+b//uAL2fXvhdIrElRHnPPIcw9+9X1nf/7dD5n6/JWhCGuqIdorU+coFQwYOkGypx1d27rRvrkdkipjZrGMn5+cxeEz83j2XBrFql4f+FkNXHdb7COMgipM1HdlBmIv3dEddnmHEQu1WcIsO+mVALg2R6w7G7hdJ1tmOVe4DBwAgZPaxinElxdqOAwhYl5PQsWSOutUrFNKQCh1AXW/EvcsOWAZFizDFGDqAkpLN2tQNrqyQD2Ybhlx/lu7Yrh2exuu29mGq7a2QpEo8gs5TJ+bwuzIFLRSCcEwgxpiG467VUsWyiVe6Nh+47/ufv37v7xp5/XH1//Uy6dXNKhezZ4+MnjmmQffMzn043cRq9AfCNGNQ2twVMom9CpHMBZDS08bUr1taOlqBRjFmYkchkYz+OX5RQyNZjCTLS2L2NY1v7iVPI/l9ewnlIJIDFSiIJKwPESiAmwmlsT7OWAZkK6bbN/QHM4EugDA4TVGdknPSdSdnnveAkzUNUt4LW2ddXWObz9YuGGJKTJNsW4ZFrhhwjKt5UA6p1MHpaj71llPAKrEsKs3gcH+JPZubsG+gRYkIwqK2QLSEwuYH59Hbm4BMDWoIZH+ZCNwci6CQ5WSqUU6rvjJluvf+K29B1//H4R0vmwBoo3osgHVqwtHf/Sq4acf/r3pU0+8S1KMZCDI0OTQzDrpGkelbECvckRak0j1tiPV24ZkVyuYxJDOVwS4I2kMXcjg+ckcKpqxgqWtBYncfZ5t13VG45KI4WiMgjBhtdylbdHgrBMCYjc1EU+deuWbtcGSchtpC25GC3fW7Lp0lgI2yxLz1XLTTgtrWvXA2cesd5U9TwuPy4oGYJ3y3a1h7O5NYHCgBb810IrtPTFIjNbAHJvF4tQ8uKFBDTKoQdZ0QMh7ilqFo1IyuBrZdHjLDbd/c9tr3nx/PN77sgeHNqrLElRHnHN5+OkHX3v20CPvnhs+9GZV4Qk1uHFLK44lnrhaxYShE4RbEmjpakVLTytaulNQwwFYFsf5mSWcHMvg3FQez09kcW4qh0JZXwNWuNHgxv22bXE/wpe93yCyyhvrfd2VKrErtZV6rSqvFfMGnJaV9cC30n4Kgt62CHb0xLGtJ45dvQns6UsiGpJFZr75LNITC0hPLSA3m4ahVaAGKNQgQ7Pt641fQatYqJZMLoW7D2+79vYHtt50678nu/aMbvhgryBd1qB6xTmXzh/98aumTz7z2pkzh15fzpy/VlappAYoyAafxI4MjUPXLGhVC1IggFA8hlgqgXh7AtFUHNGWKKjEkM5VMD5fwNh8AeNzBUylS5hIFzGdLiJf0pZDDKxYd4UX6MZyjVq2f7WCK8C1TrHadgOE3nUnCMUBiVF0JkPobg2huzWM7tYw+toj6GuPYFMqDEVmqBTKWFrIITeXRW4+h2Imh3J+CYxyyCqFrNINW0xHhsZRrVrgljrf0r//hz1X3PDotv2v+2Eo1bd2PpvLSL82oDaKZzKJE899/7Xjx5+8bf7cM28gqG5SVQpFJRcNLocITumaBV2zYOhAIBpBOBFDtDWGWFscsVQckZYoJEUk6ipWdEynS5hKFzG9WMJspoTZTBnzuTIWchXM58qo2sPi4LWsG4H2Yr/Msn2eCLBdhhKCRERFayyAVDyAjkQQnS0htCcEmD2pMNriQVBKILIblFBI55FfyCE3l0NhMY9SNgdu6ZAUCkWhkJWLf3g6v4FW4ahWLC3UsvmZ3r0H/l/fla9+pHvPjccJ2dC88ZeNfm1BbdT8yHM7Ro8feu3UqacOZiZO3kRIpUtRCRRVRDMvRZxz6BqHoVvQNQ7T4JADAQRiEYRiYYQTEUSSEYTiEYTiIQSjITCpVqkulHVkCxoySxVkixqWShqyBQ2lio5cSUO5aqJcNVCs6NAMC1XdREUzoBkWTKdOyWuBJW8LjojUEsiMQpUZggqDLDGoCkM0KEOVGaJBBeGghHhIQSQoIxlVEQ+rSEZVJCOq64JyDmjlKkq5Ikr5IorZIoqZJRRzRZTzBVSWCgAsSDKFLBPICoWYxuVSri+HrnPoFY5KxdRDib5jHTuueaxn700/3n79/p9fLsGgS9VvDKiNykyPbJ56/vB1s+d+dU128vRVhbmRqwiqKVkhkGRyUfXclcQtDsMQ8JoGh2lyWCYgKQrkgFp7qQqUoGq/FMgBMbZSDsiQZNEhXVIkUCaafqjdZtn0eQBismbDhKkbMA0LhqaLbpJVZ1SRLgbflzVo5Sq0ShV6RYNeqUCvVKFXqgC3wCQCxsQ1cl4vyLXigKFZMHQOrWrpwXj3qUj71uPtW/Yd69i69xe9+17zLCFk7dT9v6b6jQV1Jc1cOD6wcP701emRoWvmLgxdXZg9N0iI3iXJBLIsAKYXEeBoRpxzMQWiaS8tDm7aS24vLdijt+wmGthRX6fZxeMu87pIrJ0M3RMppgR2ZLm2TlnNAjvrL9Z3NQ3A0G1rqZnVQKTjVKL3iuc6B/YeSQ3sPtZ35cFjv6lQriQf1HW0NH22bW7s/GB6/NRgeuLM7qXZ0T35+eHdjFgpJhNItkWRJLs5xZcQ5zBN0XZtGByGzmHqXJODyeFE986T8e7+08murSc7+vf8qn3n/tOEkCbyy/zmyr+zLlLZ7GgyMzyyMz9zYXt+fnIgvzAxUEiPDxTTEwOWUepmEpWEiwhQZruKrL6TweUqDuG+W6aAUSyFa2+YPBeMdoyFWjadj7X3jcTaekYSXQPnkn1bzrT1XjH6Suo/eznp8r9rXoHinLN0eryjND3WXcmnO0qL6fZCZrazWsy1Vcq5VDU3n9LK+VZLryQLmZkkozxBGJWECypcTtFzSGw7PYkcz9ZZh7NYrX1VnIxY2H/cJa93ozmH7VoLF9viADctblooymokKwcii4FYKiOpkbQSSsxHkp0LaiQ6F4ynZgKJ5FyitWsqFemeIu3tK89K5euS5IP6ChFfWIguVjJxPZ+Jm6YRz89PRkBIVK8UI+V8NkgIQhwIFtLTKjcNhQMqB5Ep4cziRCIA5aSWUJ2IDsIcgAHCDYg00xo4qsF4i6YEQmUAZcJYOdrSWSRAganhpXAiuSTJSi7Y0ZWLRDqzvkvqy5cvX758+fLly5cvX758+fLly5cvX758+fLly5cvX758+fLly5cvX758+fLly5cvX758+fLly5cvX758+fLly5cvX758+fLly5cvX758+fLly5cvX758+fL1Uur/Az9NJy88xHWeAAAAAElFTkSuQmCC',
          width: 75,
          alignment : 'left'
        },
        { text: '', margin: [0, 0], },
        { text: CompanyName, style: 'fontCenterBoldSubTitle',decoration:'underline' },
        { text: '', margin: [0, 5], },
        { text: ReportName, style: 'fontCenterBoldSubTitle' },
        { text: '', margin: [0, 5], },
        {
          columns: [
            {
              stack: [
                { text: Header,fontSize: 13},
                { text: Titulo +" "+encabezado.AlmacenOrigen,fontSize: 11},
               ]
              },
              {
                stack: [
                        {text: 'Fecha: ' +moment().format('DD/MM/YYYY'), style: 'fontRightSubTitle', fontSize: 10},
                        {text: 'Hora: '+moment().format('LT'), style: 'fontRightSubTitle',fontSize: 10,margin:[0,3,0,0]}
                       ]
              }
          ]
        },
        { text: '', margin: [0, 4], border: [false, false, false, true] },
        {
          
              table: {
                headerRows: 1,
                  dontBreakRows: false,
                 keepWithHeaderRows:false,
                  //widths: '*',
                body: Data,
                margin: [0, 5, 0, 30]
              },
              
        },
        {
          margin: [50,30,50,10],
          stack:[
            {
              columns:
              [
                {
                  stack: [
                      { text: encabezado.HechoPor,fontSize: 11,style: 'fontCenterTableBody',decoration:'underline' },
                      { text: "Despachador",fontSize: 11,style: 'fontCenterTableBody',},
                   ]
                },
                {
                  stack: [
                    { text: encabezado.ValidadoPor,fontSize: 11,style: 'fontCenterTableBody',decoration:'underline' },
                      { text: "Validador",fontSize: 11,style: 'fontCenterTableBody',},
                   ]
                },
                {
                  stack: [
                    { text: encabezado.RecibidoPor,fontSize: 11,style: 'fontCenterTableBody',decoration:'underline' },
                    { text: "Recibido Por",fontSize: 11,style: 'fontCenterTableBody',},
                 ]
                },

              ]
             },
             
             {
              margin: [0,20,0,0],
              image : this.textToBase64Barcode(textForBarcode),
              alignment: 'center'
             },
             

               
          ],

        },
       
      ],
      styles: this.FontStylesPDF

    };
      const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
      this.printBlobPDF(pdfDocGenerator);
  }

  private ExportAsPDFHorizontal(ReportName: string, Header: string, TemplateCallBack: (collection, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) => Array<any>) {

    var Data = TemplateCallBack(this.DATA, this.NumberFormat, this.SumEqualProperty);

    const documentDefinition = {
      pageMargins: [5, 10],
      pageOrientation: 'landscape',
      content: [
        { text: ReportName, style: 'fontCenterBoldSubTitle' },
        { text: Header, style: 'fontCenterHeader' },
        { text: '', margin: [0, 4], border: [false, false, false, true] },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                headerRows: 1,
                //widths: '*',
                body: Data
              }
            },
            { width: '*', text: '' },
          ]
        }
      ],
      styles: this.FontStylesPDF

    };

    pdfMake.createPdf(documentDefinition).download(ReportName + '.pdf');
  }



  private ExportAsExcel(ReportName: string, Header: string, TemplateCallBack: (collection, worksheet, FontStyles, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) => void) {

    //Add Row and formatting
    let titleRow = this.Worksheet.addRow([ReportName]);
    titleRow.font = this.FontStylesExcel.SubTitle.Font;
    titleRow.alignment = this.FontStylesExcel.SubTitle.Alignment;
    this.Worksheet.mergeCells('A1:H2');

    //worksheet.addRow([]);
    let subTitleRow = this.Worksheet.addRow([Header]);
    subTitleRow.font = this.FontStylesExcel.Header.Font;
    this.Worksheet.mergeCells('A3:H4');

    //Blank Row
    this.Worksheet.addRow([]);

    // RENDERIZE TEMPLATE
    TemplateCallBack(this.DATA, this.Worksheet, this.FontStylesExcel, this.NumberFormat, this.SumEqualProperty);

    //Generate Excel File with given name
    this.Workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      // FileSaver.saveAs(blob, ReportName + '.xlsx');
    });

  }

  private   BuildReportTemplate(CompanyName:string, ReportName: string, Header: string,Titulo:string, ReportType: TypeReport, TemplatePDF: (collection, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) => Array<any>, TemplateExcel: (collection, worksheet, FontStyles, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) => void) {

    switch (ReportType) {

      case TypeReport.VIEW:
        this.ExportAsView(CompanyName,ReportName, Header, TemplatePDF);
        break;

      case TypeReport.PDF:
        this.ExportAsPDF(CompanyName,ReportName, Header,Titulo ,TemplatePDF);
        break;

      case TypeReport.EXCEL:
        this.ExportAsExcel(ReportName, Header, TemplateExcel);
        break;

      case TypeReport.VIEW_HORIZONTAL:
        this.ExportAsViewHorizontal(CompanyName,ReportName, Header, TemplatePDF);
        break;

      case TypeReport.PDF_HORIZONTAL:
        this.ExportAsPDFHorizontal(ReportName, Header, TemplatePDF);
        break;
    }

  }

  private TemplateReport_PickingTransferenciaInventarioPDF(collection:Array<any>, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) {
    let DataTemplate = [];
    let IfNegative = (number: number, StyleNormal: string, StyleRed: string) => { return number < 0 ? StyleRed : StyleNormal }


    let RowHeader = [];
    let borderHeader = [true, true, true, true];

    RowHeader.push({ text: 'Código', style: 'fontLeftBoldTableHeader', border: borderHeader });     // 2
    RowHeader.push({ text: 'Descripción', style: 'fontLeftBoldTableHeader', border: borderHeader }); 
    RowHeader.push({ text: 'A. Destino', style: 'fontLeftBoldTableHeader', border: borderHeader });       // 3
    RowHeader.push({ text: 'Envio', style: 'fontCenterBoldTableHeader', border: borderHeader });
    RowHeader.push({ text: 'U. Medida', style: 'fontLeftBoldTableHeader', border: borderHeader });     // 8
    RowHeader.push({ text: 'Recepción', style: 'fontLeftBoldTableHeader', border: borderHeader });
    DataTemplate.push(RowHeader);

    let DataTable = [];
    // CREATING GROUP
    for (var key in collection) {
      let data = collection[key];
      // let SecondKey = Object.keys(GroupOne)[0];
      let borderDataTable = [true, true, true, true];
      DataTable.push({ text: data.Codigo, style: 'fontLeftTableBody', border: borderDataTable, margin: 1});     // 1
      DataTable.push({ text: data.Descripcicon, style: 'fontLeftTableBody', border: borderDataTable, margin: 1}); 
      DataTable.push({ text: data. AlmacenDestino, style: 'fontLeftTableBody', border: borderDataTable, margin: 1});       // 2
      DataTable.push({ text: data.Envio, style: 'fontCenterTableBody', border: borderDataTable,margin: 1 });  
      DataTable.push({ text: data.UnidadMedida, style: 'fontCenterTableBody', border: borderDataTable,margin: 1 });      // 2
      DataTable.push({ text: data.Recepcion, style: 'fontLeftTableBody', border: borderDataTable,margin: 1 });       // 2
 
      DataTemplate.push(DataTable);
      DataTable = [];

    }
    //Push and Clean DataTable

    return DataTemplate;
  }

  textToBase64Barcode(text){
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, text, {
      format: "code128",
       height: 30,
       width: 1,
       fontSize: 10,
    });
    return canvas.toDataURL("image/png");
    }
    printBlobPDF(pdfDocGenerator){
      pdfDocGenerator.getBlob((blob) => {
        var blobURL = URL.createObjectURL(blob);

        let iframe =  document.createElement('iframe'); //load content in an iframe to print later
        document.body.appendChild(iframe);

        iframe.style.display = 'none';
        iframe.src = blobURL;
        iframe.onload = function() {
          setTimeout(function() {
            iframe.focus();
            iframe.contentWindow.print();
          }, 1);
        };
      });
    }


  // #endregion

}

export enum TypeReport {
  VIEW = 1,
  PDF = 2,
  EXCEL = 3,
  VIEW_HORIZONTAL = 4,
  PDF_HORIZONTAL = 5
}

export enum FormatNumber {
  CURRENCY = 1,
  NORMAL = 2
}



export function isUndefined(value: any) {
  return value === null || value === undefined;
}
