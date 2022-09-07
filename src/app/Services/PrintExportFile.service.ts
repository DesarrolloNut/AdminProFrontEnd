import { BarcodeService } from './barcode.service';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
// import * as FileSaver from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from "pdfmake/build/vfs_fonts";
import JsBarcode from 'jsbarcode/bin/JsBarcode'




pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as _ from 'underscore';
import { DespachoPreventaDetalleExportVM } from '../Modules/inventario/despacho/models/DespachoPedidoDetalleViewModel';

@Injectable({
  providedIn: 'root'
})
export class PrintExportFile {


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
  private readonly fontSizeTableHeader: number = 9;
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

    // FORMAT FONTS HEADER
    fontCenterHeader: { fontSize: this.fontSizeHeader, bold: false, alignment: 'center' },
    fontLeftHeader: { fontSize: this.fontSizeHeader, bold: false, alignment: 'left' },
    fontRightHeader: { fontSize: this.fontSizeHeader, bold: false, alignment: 'right' },
    fontCenterBoldHeader: { fontSize: this.fontSizeHeader, bold: true, alignment: 'center' },
    fontLeftBoldHeader: { fontSize: this.fontSizeHeader, bold: true, alignment: 'left' },
    fontRightBoldHeader: { fontSize: this.fontSizeHeader, bold: true, alignment: 'right' },

    // FORMAT FONTS TABLE HEADER
    fontCenterTableHeader: { fontSize: this.fontSizeTableHeader, bold: false, alignment: 'center' },
    fontLeftTableHeader: { fontSize: this.fontSizeTableHeader, bold: false, alignment: 'left' },
    fontRightTableHeader: { fontSize: this.fontSizeTableHeader, bold: false, alignment: 'right' },
    fontCenterBoldTableHeader: { fontSize: this.fontSizeTableHeader, bold: true, alignment: 'center' },
    fontLeftBoldTableHeader: { fontSize: this.fontSizeTableHeader, bold: true, alignment: 'left' },
    fontRightBoldTableHeader: { fontSize: this.fontSizeTableHeader, bold: true, alignment: 'right' },

    // FORMAT FONTS TABLE GROUP
    fontCenterTableGroup: { fontSize: this.fontSizeTableGroup, bold: false, alignment: 'center' },
    fontLeftTableGroup: { fontSize: this.fontSizeTableGroup, bold: false, alignment: 'left' },
    fontRightTableGroup: { fontSize: this.fontSizeTableGroup, bold: false, alignment: 'right' },
    fontCenterBoldTableGroup: { fontSize: this.fontSizeTableGroup, bold: true, alignment: 'center' },
    fontLeftBoldTableGroup: { fontSize: this.fontSizeTableGroup, bold: true, alignment: 'left' },
    fontRightBoldTableGroup: { fontSize: this.fontSizeTableGroup, bold: true, alignment: 'right' },

    // FORMAT FONTS TABLE BODY
    fontCenterTableBody: { fontSize: this.fontSizeTableBody, bold: false, alignment: 'center' },
    fontLeftTableBody: { fontSize: this.fontSizeTableBody, bold: false, alignment: 'left' },
    fontRightTableBody: { fontSize: this.fontSizeTableBody, bold: false, alignment: 'right' },
    fontCenterBoldTableBody: { fontSize: this.fontSizeTableBody, bold: true, alignment: 'center' },
    fontLeftBoldTableBody: { fontSize: this.fontSizeTableBody, bold: true, alignment: 'left' },
    fontRightBoldTableBody: { fontSize: this.fontSizeTableBody, bold: true, alignment: 'right' },

    // FORMAT FONTS TABLE GROUP
    fontCenterTableGroupRed: { fontSize: this.fontSizeTableGroup, bold: false, alignment: 'center', color: '#FF0000' },
    fontLeftTableGroupRed: { fontSize: this.fontSizeTableGroup, bold: false, alignment: 'left' , color:'#FF0000'},
    fontRightTableGroupRed: { fontSize: this.fontSizeTableGroup, bold: false, alignment: 'right' , color:'#FF0000'},
    fontCenterBoldTableGroupRed: { fontSize: this.fontSizeTableGroup, bold: true, alignment: 'center' , color:'#FF0000'},
    fontLeftBoldTableGroupRed: { fontSize: this.fontSizeTableGroup, bold: true, alignment: 'left' , color:'#FF0000'},
    fontRightBoldTableGroupRed: { fontSize: this.fontSizeTableGroup, bold: true, alignment: 'right' , color:'#FF0000'},

    // FORMAT FONTS TABLE BODY
    fontCenterTableBodyRed: { fontSize: this.fontSizeTableBody, bold: false, alignment: 'center' , color:'#FF0000'},
    fontLeftTableBodyRed: { fontSize: this.fontSizeTableBody, bold: false, alignment: 'left', color:'#FF0000' },
    fontRightTableBodyRed: { fontSize: this.fontSizeTableBody, bold: false, alignment: 'right', color:'#FF0000' },
    fontCenterBoldTableBodyRed: { fontSize: this.fontSizeTableBody, bold: true, alignment: 'center' , color:'#FF0000'},
    fontLeftBoldTableBodyRed: { fontSize: this.fontSizeTableBody, bold: true, alignment: 'left' , color:'#FF0000'},
    fontRightBoldTableBodyRed: { fontSize: this.fontSizeTableBody, bold: true, alignment: 'right', color:'#FF0000' },
  
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

  public ExportFile(collection: Array<any>, CompanyName:string,ReportName: string, Header: string, ReportType: TypeReport, ReporteKey: string, PropertyForGroup: Array<string> = []) {



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
        return this.BuildReportTemplate(CompanyName,ReportName, Header, ReportType, this.TemplateReport_PickingPreventaPDF,null);

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

  private ExportAsPDF(CompanyName,ReportName: string, Header: string, TemplateCallBack: (collection, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) => Array<any>) {


    var Data = TemplateCallBack(this.DATA, this.NumberFormat, this.SumEqualProperty);

    let firstData:DespachoPreventaDetalleExportVM= this.DATA[0]
     if(firstData.Despachador==undefined || firstData.Despachador==''){
        firstData.Despachador='                                   ';
      }

    let fechaEntrega =moment(firstData.FechaEntrega).format('YYYY-MM-DD')
    let textForBarcode = `A-${firstData.RutaId}-${fechaEntrega.split('-').join('')}`;

    const documentDefinition = {
      pageMargins: [40,35,40, 100],
      content: [
        { text: CompanyName, style: 'fontCenterBoldSubTitle',decoration:'underline' },
        { text: '', margin: [0, 5], },
        { text: ReportName, style: 'fontCenterBoldSubTitle' },
        { text: '', margin: [0, 5], },
        {
          columns: [
             {
              stack: [
                { text: Header,fontSize: 13},
                { text: "De almacén "+  firstData.Almacen_Desde,fontSize: 11},
               ]
              },
              {
                stack: [
                        {
                          text: 'Fecha: ' +moment().format('DD/MM/YYYY'), style: 'fontRightTableBody', fontSize: 10
                        },
                        {
                          text: 'Hora: '+moment().format('LT'), style: 'fontRightTableBody',fontSize: 10,margin:[0,3,0,0]
                        }
                    ]
              }

          ]
        },

        { text: '', margin: [0, 4], border: [false, false, false, true] },
        {
              table: {
                headerRows: 1,
                //  dontBreakRows: true,
                // keepWithHeaderRows:true,
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
                      { text: firstData.Despachador,fontSize: 11,style: 'fontCenterTableBody',decoration:'underline' },
                      { text: "Despachador",fontSize: 13,style: 'fontCenterTableBody',},
                   ]
                },
                {
                  stack: [
                      { text: "______________________",fontSize: 11,style: 'fontCenterTableBody',},
                      { text: "Validador",fontSize: 13,style: 'fontCenterTableBody',},
                   ]
                },
                {
                  stack: [
                    { text: firstData.Distribuidor+"("+firstData.Ruta+")",fontSize: 11,style: 'fontCenterTableBody', decoration:'underline' },
                    { text: "Distribuidor",fontSize: 13,style: 'fontCenterTableBody',},
                 ]
                },

              ]
             },
             {
              margin: [0,20,0,0],
              image : this.textToBase64Barcode(textForBarcode),
              alignment: 'center'
             }
          ],

        },
        // {
        //   margin: [50,30,50,10],

        //   stack: [
        //     { text: this.DATA[0].Distribuidor+"("+this.DATA[0].Ruta+")",fontSize: 13,style: 'fontCenterTableBody', decoration:'underline' },
        //     { text: "Distribuidor",fontSize: 13,style: 'fontCenterTableBody',},
        //  ]
        // },
      ],
      styles: this.FontStylesPDF

    };
  console.log(this.DATA[0])

  //  MANERA ANTERIOR
  //  pdfMake.createPdf(documentDefinition).print();

  //  MANERA ACTUAL -> DE ESTA MANERA SE PUEDE UTILIZAR LA FUNCIONALIDA DE SILENT_PRINT QUE OFRECE GOOGLE CHROME
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

  private   BuildReportTemplate(CompanyName:string, ReportName: string, Header: string, ReportType: TypeReport, TemplatePDF: (collection, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) => Array<any>, TemplateExcel: (collection, worksheet, FontStyles, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) => void) {

    switch (ReportType) {

      case TypeReport.VIEW:
        this.ExportAsView(CompanyName,ReportName, Header, TemplatePDF);
        break;

      case TypeReport.PDF:
        this.ExportAsPDF(CompanyName,ReportName, Header, TemplatePDF);
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

  // #endregion

  // #region REPORTS TEMPLATES



  private TemplateReport_PickingPreventaPDF(collection:Array<any>, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) {
    let DataTemplate = [];
    let IfNegative = (number: number, StyleNormal: string, StyleRed: string) => { return number < 0 ? StyleRed : StyleNormal }


    let RowHeader = [];
    let borderHeader = [true, true, true, true];

    RowHeader.push({ text: 'Número de articulo', style: 'fontLeftBoldTableHeader', border: borderHeader });     // 2
    RowHeader.push({ text: 'Descripción', style: 'fontLeftBoldTableHeader', border: borderHeader });        // 3
    RowHeader.push({ text: 'A almacen', style: 'fontCenterBoldTableHeader', border: borderHeader });     // 8
    RowHeader.push({ text: 'Unidad de medida', style: 'fontLeftBoldTableHeader', border: borderHeader });
    RowHeader.push({ text: 'Piezas', style: 'fontCenterBoldTableHeader', border: borderHeader });       // 10
    RowHeader.push({ text: 'Cantidad', style: 'fontCenterBoldTableHeader', border: borderHeader });       // 10
    RowHeader.push({ text: 'Despachado', style: 'fontLeftBoldTableHeader', border: borderHeader });       // 10


    DataTemplate.push(RowHeader);

    let DataTable = [];
    // CREATING GROUP
    for (var key in collection) {
      let data = collection[key];
      // let SecondKey = Object.keys(GroupOne)[0];
      let borderDataTable = [true, true, true, true];
      DataTable.push({ text: data.CodigoArticulo, style: 'fontLeftTableBody', border: borderDataTable, margin: 1});     // 1
      DataTable.push({ text: data.Descripcion, style: 'fontLeftTableBody', border: borderDataTable, margin: 1});       // 2
      DataTable.push({ text: data.Almacen_Hasta, style: 'fontCenterTableBody', border: borderDataTable,margin: 1 });       // 2
      DataTable.push({ text: data.Unidad, style: 'fontLeftTableBody', border: borderDataTable,margin: 1 });       // 2
      DataTable.push({ text: data.Piezas, style: 'fontLeftTableBody', border: borderDataTable,margin: 1 });       // 2
      DataTable.push({ text: data.Pedido, style: 'fontCenterTableBody', border: borderDataTable,margin: 1 });       // 2
      DataTable.push({ text: data.Despacho, style: 'fontLeftTableBody', border: borderDataTable,margin: 1 });       // 2
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
