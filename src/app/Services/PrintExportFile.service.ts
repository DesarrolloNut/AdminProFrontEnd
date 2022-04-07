import { Injectable } from '@angular/core';
import * as moment from 'moment';
// import * as FileSaver from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as _ from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class PrintExportFile {


  constructor() { }
  // IMPORT EXCELJS GLOBAL
  private readonly Excel = require('exceljs');
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

  private CreateGroupForPropertyWithKey(colletion, propertys: Array<string>) {


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
      let colletionInit = this.CreateOneGroupWithKey(colletion, propertys[0]);
      for (var key in colletionInit) {
        for (var y = 1; y < propertys.length; y++) {
          colletionInit[key] = this.CreateOneGroupWithKey(colletionInit[key], propertys[y]);
        }
      }
      return colletionInit;
    }
    return [];
  }

  private TotalColletion(colletion) {
    let data = this.SumEqualProperty(colletion);
    return data;
  }

  //#endregion

  //#region METHODS UTILITIES

  private RenameKey(obj, old_key, new_key) {
    // check if old key = new key
    if (old_key !== new_key) {
      Object.defineProperty(obj, new_key, // modify old key
        // fetch description from object
        Object.getOwnPropertyDescriptor(obj, old_key));
      delete obj[old_key];                // delete old key
    }
  }

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


      case 'RPT001':
        break;

      case 'RPT002':
        break;

      case 'RPT003':
        break;

      case 'RPT004':
        break;

      case 'RPT005':
        return this.BuildReportTemplate(CompanyName,ReportName, Header, ReportType, this.TemplateReport_BeneficiosLoteriayFechaPDF, this.TemplateReport_BeneficiosLoteriayFechaEXCEL);

      case 'RPT006':
        return this.BuildReportTemplate(CompanyName,ReportName, Header, ReportType, this.TemplateReport_PickingPreventaPDF, this.TemplateReport_TwoExcel);

      case 'RPT007':
        return this.BuildReportTemplate(CompanyName,ReportName, Header, ReportType,this.TemplateReport_OnePDF, this.TemplateReport_OneExcel);

      case 'RPT008':
        return this.BuildReportTemplate(CompanyName,ReportName, Header, ReportType,this.TemplateReport_OnePDF, this.TemplateReport_OneExcel);

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

     if(this.DATA[0].Despachador==undefined || this.DATA[0].Despachador==''){
       this.DATA[0].Despachador='                                   ';
     }

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
                { text: "De almacén "+  this.DATA[0].Almacen_Desde,fontSize: 11},
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
          columns:
          [


            {
              stack: [
                  { text: this.DATA[0].Despachador,fontSize: 13,style: 'fontCenterTableBody',decoration:'underline' },
                  { text: "Despachador",fontSize: 13,style: 'fontCenterTableBody',},
               ]
            },
            {
              stack: [
                  { text: "______________________",fontSize: 13,style: 'fontCenterTableBody',},
                  { text: "Validador",fontSize: 13,style: 'fontCenterTableBody',},
               ]
            },
            {
              stack: [
                { text: this.DATA[0].Distribuidor+"("+this.DATA[0].Ruta+")",fontSize: 13,style: 'fontCenterTableBody', decoration:'underline' },
                { text: "Distribuidor",fontSize: 13,style: 'fontCenterTableBody',},
             ]
            },
          ]
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

    pdfMake.createPdf(documentDefinition).print();
    //pdfMake.createPdf(documentDefinition).open({}, window);

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

  private TemplateReport_OnePDF(collection, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) {
    let DataTemplate = [];
    let IfNegative = (number: number, StyleNormal: string, StyleRed: string) => { return number < 0 ? StyleRed : StyleNormal }

    // COLUMN TABLE
    let RowHeader = [];
    let borderHeader = [false, true, false, true];
    RowHeader.push({ text: 'Ticket', style: 'fontCenterBoldTableHeader', border: borderHeader });     // 2
    RowHeader.push({ text: 'Hora', style: 'fontCenterBoldTableHeader', border: borderHeader });        // 3
    RowHeader.push({ text: null, border: borderHeader });          // 1
    RowHeader.push({ text: null, border: borderHeader });          // 4
    RowHeader.push({ text: null, border: borderHeader });          // 5
    RowHeader.push({ text: null, border: borderHeader });          // 6
    RowHeader.push({ text: 'Premios', style: 'fontCenterBoldTableHeader', border: borderHeader });     // 8
    RowHeader.push({ text: null, border: borderHeader });          // 7
    RowHeader.push({ text: null,  border: borderHeader });          // 9
    RowHeader.push({ text: 'Saco', style: 'fontCenterBoldTableHeader', border: borderHeader });       // 10
    // Add Header to Template
    DataTemplate.push(RowHeader);




    return DataTemplate;
  }
  private TemplateReport_OneExcel(collection, worksheet, FontStyles, NumberFormat: (numero: number, formatNumber: FormatNumber,  visibleCero: boolean) => string, TotalColletion: (colletion) => any) {


    // COLUMN TABLE
    let RowHeader = [];
    RowHeader.push('Ticket');     // 2
    RowHeader.push('Hora');        // 3
    RowHeader.push('');          // 1
    RowHeader.push('');          // 4
    RowHeader.push('');          // 5
    RowHeader.push('');          // 6
    RowHeader.push('Premios');     // 8
    RowHeader.push('');          // 7
    RowHeader.push('');          // 9
    RowHeader.push('Saco');       // 10
    // Add Header to Template
    let TableHeader = worksheet.addRow(RowHeader);
    TableHeader.font = FontStyles.TableHeader.Font;
    TableHeader.alignment = FontStyles.TableHeader.Alignment;
    TableHeader.border = FontStyles.TableHeader.Border;

    // CREATING GROUP
    for (var key in collection) {
      let GroupOne = collection[key];
      let SecondKey = Object.keys(GroupOne)[0];
      let TotalForGropOne = [];

      // ROW GROUP ONE
      let RowGroupOne = [];
      RowGroupOne.push('Loteria: ' + key);    // 1
      RowGroupOne.push('');                 // 2
      RowGroupOne.push('Numeros');            // 4
      RowGroupOne.push('Pales');              // 5
      RowGroupOne.push('Precio');             // 6
      RowGroupOne.push(GroupOne[SecondKey][0].PremioQ1); // 7
      RowGroupOne.push(GroupOne[SecondKey][0].PremioQ2); // 8
      RowGroupOne.push(GroupOne[SecondKey][0].PremioQ3); // 9
      RowGroupOne.push('Pales');              // 10
      RowGroupOne.push('');                 // 3

      //Push and Clean RowGroupOne
      let RowGroupOneStyle = worksheet.addRow(RowGroupOne);
      RowGroupOneStyle.font = FontStyles.TableGroup.Font;
      RowGroupOneStyle.alignment = FontStyles.TableGroup.Alignment;
      RowGroupOneStyle.border = FontStyles.TableGroup.Border;
      RowGroupOne = [];

      for (var key2 in GroupOne) {
        let GroupTwo = GroupOne[key2];



        // ROW GROUP TWO
        let RowGroupTwo = [];
        RowGroupTwo.push('Banca: ' + key2);
        //Push and Clean RowGroupOne
        let RowGroupTwoStyle = worksheet.addRow(RowGroupTwo);
        RowGroupTwoStyle.font = FontStyles.TableGroup.Font;
        RowGroupTwoStyle.alignment = FontStyles.TableGroup.Alignment;
        RowGroupTwoStyle.border = FontStyles.TableGroup.Border;
        RowGroupTwo = [];

        for (var key3 in GroupTwo) {
          let data = GroupTwo[key3];

          //Add Data for Total Group One
          TotalForGropOne.push(data);

          // ADD DATA TEMPLATE
          let DataTable = [];
          DataTable.push(data.Ticket);     // 1
          DataTable.push(data.Hora);       // 2
          DataTable.push(NumberFormat(data.Numeros, FormatNumber.NORMAL, false));    // 3
          DataTable.push(NumberFormat(data.Pales, FormatNumber.CURRENCY, false));      // 4
          DataTable.push(NumberFormat(data.Costo, FormatNumber.CURRENCY, false));      // 5
          DataTable.push(NumberFormat(data.CPrimera, FormatNumber.NORMAL, false));   // 6
          DataTable.push(NumberFormat(data.CSegunda, FormatNumber.NORMAL, false));   // 7
          DataTable.push(NumberFormat(data.CTercera, FormatNumber.NORMAL, false));   // 8
          DataTable.push(NumberFormat(data.MPales, FormatNumber.CURRENCY, false));     // 9
          DataTable.push(NumberFormat(data.Saco, FormatNumber.CURRENCY, false));       // 10

          //Push and Clean DataTable
          let DataTableStyle = worksheet.addRow(DataTable);
          DataTableStyle.font = FontStyles.TableBody.Font;
          DataTableStyle.alignment = FontStyles.TableBody.Alignment;
          DataTableStyle.border = FontStyles.TableBody.Border;
          DataTable = [];

        }



        //TOTALES POR GRUPO DE DATA
        let listTotal = [];
        let TotalGroup: any = TotalColletion(GroupTwo);
        listTotal.push('');     // 1
        listTotal.push('');     // 1
        listTotal.push(NumberFormat(TotalGroup.Numeros, FormatNumber.NORMAL, false));    // 3
        listTotal.push(NumberFormat(TotalGroup.Pales, FormatNumber.CURRENCY, false));      // 4
        listTotal.push(NumberFormat(TotalGroup.Costo, FormatNumber.CURRENCY, false));      // 5
        listTotal.push('');     // 1
        listTotal.push(GroupTwo.length);     // 1
        listTotal.push('');     // 1
        listTotal.push(NumberFormat(TotalGroup.MPales, FormatNumber.CURRENCY, false));     // 9
        listTotal.push(NumberFormat(TotalGroup.Saco, FormatNumber.CURRENCY, false));       // 10

        //Push and Clean DataTable
        let listTotalStyle = worksheet.addRow(listTotal);
        listTotalStyle.font = FontStyles.TableTotal.Font;
        listTotalStyle.alignment = FontStyles.TableTotal.Alignment;
        listTotalStyle.border = FontStyles.TableTotal.Border;
        listTotal = [];




      }

      //BLANK SPACE
      worksheet.addRow([]);

      //TOTALES POR GRUPO DE DATA
      let TotalGroupTemplate = [];
      let TotalGroupData: any = TotalColletion(TotalForGropOne);
      TotalGroupTemplate.push('');     // 1
      TotalGroupTemplate.push('');     // 1
      TotalGroupTemplate.push(NumberFormat(TotalGroupData.Numeros, FormatNumber.NORMAL, false));    // 3
      TotalGroupTemplate.push(NumberFormat(TotalGroupData.Pales, FormatNumber.CURRENCY, false));      // 4
      TotalGroupTemplate.push(NumberFormat(TotalGroupData.Costo, FormatNumber.CURRENCY, false));      // 5
      TotalGroupTemplate.push('');     // 1
      TotalGroupTemplate.push('');     // 1
      TotalGroupTemplate.push('');     // 1
      TotalGroupTemplate.push(NumberFormat(TotalGroupData.MPales, FormatNumber.CURRENCY, false));     // 9
      TotalGroupTemplate.push(NumberFormat(TotalGroupData.Saco, FormatNumber.CURRENCY, false));       // 10

      //Push and Clean DataTable
      let TotalGroupTemplateStyle = worksheet.addRow(TotalGroupTemplate);
      TotalGroupTemplateStyle.font = FontStyles.TableTotal.Font;
      TotalGroupTemplateStyle.alignment = FontStyles.TableTotal.Alignment;
      TotalGroupTemplateStyle.border = FontStyles.TableTotal.Border;
      TotalGroupTemplate = [];

      //BLANK SPACE
      worksheet.addRow([]);

    }


  }

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
  private TemplateReport_TwoExcel(collection, worksheet, FontStyles, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) {


    // COLUMN TABLE
    let RowHeader = [];
    RowHeader.push('Ticket');     // 2
    RowHeader.push('Hora');        // 3
    RowHeader.push('');          // 1
    RowHeader.push('');          // 4
    RowHeader.push('');          // 5
    RowHeader.push('');          // 6
    RowHeader.push('Premios');     // 8
    RowHeader.push('');          // 7
    RowHeader.push('');          // 9
    RowHeader.push('');          // 9
    RowHeader.push('Saco');       // 10
    // Add Header to Template
    let TableHeader = worksheet.addRow(RowHeader);
    TableHeader.font = FontStyles.TableHeader.Font;
    TableHeader.alignment = FontStyles.TableHeader.Alignment;
    TableHeader.border = FontStyles.TableHeader.Border;

    // CREATING GROUP
    for (var key in collection) {
      let GroupOne = collection[key];
      let SecondKey = Object.keys(GroupOne)[0];
      let TotalForGropOne = [];

      // ROW GROUP ONE
      let RowGroupOne = [];
      RowGroupOne.push('Loteria: ' + key);    // 1
      RowGroupOne.push('');                 // 2
      RowGroupOne.push('Numeros');            // 4
      RowGroupOne.push('Pales');              // 5
      RowGroupOne.push('Precio');             // 6
      RowGroupOne.push(GroupOne[SecondKey][0].PremioQ1); // 7
      RowGroupOne.push(GroupOne[SecondKey][0].PremioQ2); // 8
      RowGroupOne.push(GroupOne[SecondKey][0].PremioQ3); // 9
      RowGroupOne.push('Pales');              // 10
      RowGroupOne.push('Impuestos');              // 10
      RowGroupOne.push('');                 // 3

      //Push and Clean RowGroupOne
      let RowGroupOneStyle = worksheet.addRow(RowGroupOne);
      RowGroupOneStyle.font = FontStyles.TableGroup.Font;
      RowGroupOneStyle.alignment = FontStyles.TableGroup.Alignment;
      RowGroupOneStyle.border = FontStyles.TableGroup.Border;
      RowGroupOne = [];

      for (var key2 in GroupOne) {
        let GroupTwo = GroupOne[key2];



        // ROW GROUP TWO
        let RowGroupTwo = [];
        RowGroupTwo.push('Banca: ' + key2);
        //Push and Clean RowGroupOne
        let RowGroupTwoStyle = worksheet.addRow(RowGroupTwo);
        RowGroupTwoStyle.font = FontStyles.TableGroup.Font;
        RowGroupTwoStyle.alignment = FontStyles.TableGroup.Alignment;
        RowGroupTwoStyle.border = FontStyles.TableGroup.Border;
        RowGroupTwo = [];

        for (var key3 in GroupTwo) {
          let data = GroupTwo[key3];

          //Add Data for Total Group One
          TotalForGropOne.push(data);

          // ADD DATA TEMPLATE
          let DataTable = [];
          DataTable.push(data.Ticket);     // 1
          DataTable.push(data.Hora);       // 2
          DataTable.push(NumberFormat(data.Numeros, FormatNumber.NORMAL, false));    // 3
          DataTable.push(NumberFormat(data.Pales, FormatNumber.CURRENCY, false));      // 4
          DataTable.push(NumberFormat(data.Costo, FormatNumber.CURRENCY, false));      // 5
          DataTable.push(NumberFormat(data.CPrimera, FormatNumber.NORMAL, false));   // 6
          DataTable.push(NumberFormat(data.CSegunda, FormatNumber.NORMAL, false));   // 7
          DataTable.push(NumberFormat(data.CTercera, FormatNumber.NORMAL, false));   // 8
          DataTable.push(NumberFormat(data.MPales, FormatNumber.CURRENCY, false));     // 9
          DataTable.push(NumberFormat(data.Impuestos, FormatNumber.CURRENCY, false));     // 9
          DataTable.push(NumberFormat(data.Saco, FormatNumber.CURRENCY, false));       // 10

          //Push and Clean DataTable
          let DataTableStyle = worksheet.addRow(DataTable);
          DataTableStyle.font = FontStyles.TableBody.Font;
          DataTableStyle.alignment = FontStyles.TableBody.Alignment;
          DataTableStyle.border = FontStyles.TableBody.Border;
          DataTable = [];

        }



        //TOTALES POR GRUPO DE DATA
        let listTotal = [];
        let TotalGroup: any = TotalColletion(GroupTwo);
        listTotal.push('');     // 1
        listTotal.push('');     // 1
        listTotal.push(NumberFormat(TotalGroup.Numeros, FormatNumber.NORMAL, false));    // 3
        listTotal.push(NumberFormat(TotalGroup.Pales, FormatNumber.CURRENCY, false));      // 4
        listTotal.push(NumberFormat(TotalGroup.Costo, FormatNumber.CURRENCY, false));      // 5
        listTotal.push('');     // 1
        listTotal.push(GroupTwo.length);     // 1
        listTotal.push('');     // 1
        listTotal.push(NumberFormat(TotalGroup.MPales, FormatNumber.CURRENCY, false));     // 9
        listTotal.push(NumberFormat(TotalGroup.Impuestos, FormatNumber.CURRENCY, false));     // 9
        listTotal.push(NumberFormat(TotalGroup.Saco, FormatNumber.CURRENCY, false));       // 10

        //Push and Clean DataTable
        let listTotalStyle = worksheet.addRow(listTotal);
        listTotalStyle.font = FontStyles.TableTotal.Font;
        listTotalStyle.alignment = FontStyles.TableTotal.Alignment;
        listTotalStyle.border = FontStyles.TableTotal.Border;
        listTotal = [];




      }

      //BLANK SPACE
      worksheet.addRow([]);

      //TOTALES POR GRUPO DE DATA
      let TotalGroupTemplate = [];
      let TotalGroupData: any = TotalColletion(TotalForGropOne);
      TotalGroupTemplate.push('');     // 1
      TotalGroupTemplate.push('');     // 1
      TotalGroupTemplate.push(NumberFormat(TotalGroupData.Numeros, FormatNumber.NORMAL, false));    // 3
      TotalGroupTemplate.push(NumberFormat(TotalGroupData.Pales, FormatNumber.CURRENCY, false));      // 4
      TotalGroupTemplate.push(NumberFormat(TotalGroupData.Costo, FormatNumber.CURRENCY, false));      // 5
      TotalGroupTemplate.push('');     // 1
      TotalGroupTemplate.push('');     // 1
      TotalGroupTemplate.push('');     // 1
      TotalGroupTemplate.push(NumberFormat(TotalGroupData.MPales, FormatNumber.CURRENCY, false));     // 9
      TotalGroupTemplate.push(NumberFormat(TotalGroupData.Impuestos, FormatNumber.CURRENCY, false));     // 9
      TotalGroupTemplate.push(NumberFormat(TotalGroupData.Saco, FormatNumber.CURRENCY, false));       // 10

      //Push and Clean DataTable
      let TotalGroupTemplateStyle = worksheet.addRow(TotalGroupTemplate);
      TotalGroupTemplateStyle.font = FontStyles.TableTotal.Font;
      TotalGroupTemplateStyle.alignment = FontStyles.TableTotal.Alignment;
      TotalGroupTemplateStyle.border = FontStyles.TableTotal.Border;
      TotalGroupTemplate = [];

      //BLANK SPACE
      worksheet.addRow([]);

    }


  }


  private TemplateReport_SimplePDF(collection, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) {
    let DataTemplate = [];
    let IfNegative = (number: number, StyleNormal: string, StyleRed: string) => { return number < 0 ? StyleRed : StyleNormal }

    //GET COLUMN NAME
    let listNamesColumns = [];
    let borderHeader = [false, true, false, true];
    var NamesColumns = Object.keys(collection[0]);

    // Agregando Color a Header
    for (var i in NamesColumns) {
      listNamesColumns.push({ text: NamesColumns[i], style: 'fontCenterBoldTableHeader', border: borderHeader});
    }
    // Agregando header a la lista
    DataTemplate.push(listNamesColumns);

    // CREATING TEMPLATE
    for (var item in collection) {
      let selectObject = collection[item];
      //VALIDANDO FECHA
      if (!isUndefined(selectObject.Fecha)) {
        let fecha = moment(selectObject.Fecha).format('DD-MMM');
        selectObject.Fecha = fecha;
      }
      //AGREGANDO DATA
      var listValue = [];
      let values = Object.values(selectObject);
      for (var x in values) {
        let value = values[x];

        if (value === "") {
          value = null;
        }

        let borderDataTable = [false, false, false, false];


        if (!Number.isNaN(Number(value)) && value < 0) {

          value = NumberFormat(Number(value), FormatNumber.NORMAL, true);
          listValue.push({ text: value, style: 'fontRightBoldTableBodyRed', border: borderDataTable });

        } else if (!Number.isNaN(Number(value))) {
          value = NumberFormat(Number(value), FormatNumber.NORMAL, true);
          listValue.push({ text: value, style: 'fontRightTableBody', border: borderDataTable });

        } else {
          listValue.push({ text: value, style: 'fontLeftTableBody', border: borderDataTable });
        }

      }
      DataTemplate.push(listValue);
    }

    //TOTALES POR GRUPO DE DATA
    //let listTotal = [];
    let LineOne = [];
    let LineTwo = [];
    let Aleatorio: Boolean = true;
    let borderTotalGroup = [false, true, false, false];
    let resources = TotalColletion(collection);

    let report = _.uniq(collection, NamesColumns[0]).length;
    LineOne.unshift({ text: 'Resumen: ', style: 'fontLeftBoldTableBody', border: borderTotalGroup });
    LineTwo.unshift({ text: report, style: 'fontCenterBoldTableBody', border: [false, false, false, false] });

    for (var x in resources) {
      let data = resources[x];
      Aleatorio = !Aleatorio;
      if (!Number.isNaN(Number(data))) {
        if (Aleatorio) {
          LineOne.push({ text: NumberFormat(data, FormatNumber.CURRENCY, true), style: IfNegative(Number(data), 'fontRightBoldTableBody', 'fontRightBoldTableBodyRed'), border: borderTotalGroup })
          LineTwo.push({ text: null, border: [false, false, false, false]  });
        } else if (!Aleatorio) {
          LineTwo.push({ text: NumberFormat(data, FormatNumber.CURRENCY, true), style: IfNegative(Number(data), 'fontRightBoldTableBody', 'fontRightBoldTableBodyRed'), border: [false, false, false, false] })
          LineOne.push({ text: null, border: borderTotalGroup  });
        }
      }
    }
    //ESPACIOS VACIOS
    let CountForComplete = (ArrayCompleted, ArrayForComplete) => { return (ArrayCompleted.length - ArrayForComplete.length) < 0 ? 0 : (ArrayCompleted.length - ArrayForComplete.length); };
    let dataLenght = CountForComplete(NamesColumns, LineOne);
    for (var z = 0; z < dataLenght; z++) {
      LineOne.unshift({ text: null, border: borderTotalGroup });
      LineTwo.unshift({ text: null, border: [false, false, false, false] });
    }
    DataTemplate.push(LineOne);
    DataTemplate.push(LineTwo);


    return DataTemplate;
  }
  private TemplateReport_SimpleExcel(collection, worksheet, FontStyles, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) {

    //GET COLUMN NAME
    var NamesColumns = Object.keys(collection[0]);
    //Add Header Row
    let headerRow = worksheet.addRow(NamesColumns);
    headerRow.font = FontStyles.TableHeader.Font;
    headerRow.alignment = FontStyles.TableHeader.Alignment;
    headerRow.border = FontStyles.TableHeader.Border;


    for (var x in collection) {

      let value = collection[x];

      //VALIDANDO FECHA
      if (!isUndefined(value.Fecha)) {
        let fecha = moment(value.Fecha).format('DD-MMM');
        value.Fecha = fecha;
      }

      let dataForValue = Object.values(value);
      let dataStyle = worksheet.addRow(dataForValue);
      dataStyle.font = FontStyles.TableBody.Font;
      dataStyle.alignment = FontStyles.TableBody.Alignment;
      dataStyle.border = FontStyles.TableBody.Border;
    }

    //TOTALES POR GRUPO DE DATA
    let listTotal = [];
    let resources = TotalColletion(collection);
    let report = _.uniq(collection, NamesColumns[0]).length;
    listTotal.unshift('Resumen: ' + report);

    for (var x in resources) {
      let data = resources[x];
      if (!Number.isNaN(Number(data))) {
        listTotal.push(NumberFormat(data, FormatNumber.CURRENCY, true))
      }
    }

    //ESPACIOS VACIOS
    let dataLenght = (NamesColumns.length - listTotal.length) < 0 ? 0 : (NamesColumns.length - listTotal.length);
    for (var z = 0; z < dataLenght; z++) {
      listTotal.unshift(' ');
    }
    let TotalGroups = worksheet.addRow(listTotal);
    TotalGroups.font = FontStyles.TableTotal.Font;
    TotalGroups.alignment = FontStyles.TableTotal.Alignment;
    TotalGroups.border = FontStyles.TableTotal.Border;
    //Blank Row
    worksheet.addRow([]);

  }


  private TemplateReport_GroupOnePDF(collection, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) {
    let DataTemplate = [];
    let IfNegative = (number: number, StyleNormal: string, StyleRed: string) => { return number < 0 ? StyleRed : StyleNormal }

    //GET COLUMN NAME
    let listNamesColumns = [];
    let borderHeader = [false, true, false, true];

    let keyGroupOne = Object.keys(collection)[0];
    var NamesColumns = Object.keys(collection[keyGroupOne][0]);

    // Agregando Color a Header
    for (var i in NamesColumns) {
      listNamesColumns.push({ text: NamesColumns[i], style: 'fontCenterBoldTableHeader', border: borderHeader });
    }
    // Agregando header a la lista
    DataTemplate.push(listNamesColumns);

    let allGroupOne = [];

    for (let item in collection) {

      // ROW GROUP ONE
      let GroupOne = collection[item];
      DataTemplate.push([{ text: item, colSpan: NamesColumns.length, style: 'fontLeftBoldTableGroup', border: [false, false, false, false] }]);

      // CREATING TEMPLATE
      for (let key in GroupOne) {
        let selectObject = GroupOne[key];
        allGroupOne.push(selectObject);
        //VALIDANDO FECHA
        if (!isUndefined(selectObject.Fecha)) {
          let fecha = moment(selectObject.Fecha).format('DD-MMM');
          selectObject.Fecha = fecha;
        }
        //AGREGANDO DATA
        var listValue = [];
        let values = Object.values(selectObject);
        for (var x in values) {
          let value = values[x];

          if (value === "") {
            value = null;
          }

          let borderDataTable = [false, false, false, false];

          if (!Number.isNaN(Number(value)) && value < 0) {

            value = NumberFormat(Number(value), FormatNumber.NORMAL, true);
            listValue.push({ text: value, style: 'fontRightBoldTableBodyRed', border: borderDataTable });

          } else if (!Number.isNaN(Number(value))) {
            value = NumberFormat(Number(value), FormatNumber.NORMAL, true);
            listValue.push({ text: value, style: 'fontRightTableBody', border: borderDataTable });

          } else {
            listValue.push({ text: value, style: 'fontLeftTableBody', border: borderDataTable });
          }

        }
        DataTemplate.push(listValue);
      }

      //TOTALES POR GRUPO DE DATA
      let listTotal = [];
      let borderTotalGroup = [false, true, false, false];
      let resources = TotalColletion(GroupOne);

      for (var x in resources) {
        let data = resources[x];
        if (!Number.isNaN(Number(data))) {
          listTotal.push({ text: NumberFormat(data, FormatNumber.CURRENCY, true), style: IfNegative(parseInt(data), 'fontRightBoldTableBody', 'fontRightBoldTableBodyRed'), border: borderTotalGroup })
        }
      }
      //ESPACIOS VACIOS
      let dataLenght = (NamesColumns.length - listTotal.length) < 0 ? 0 : (NamesColumns.length - listTotal.length);
      for (var z = 0; z < dataLenght; z++) {
        listTotal.unshift({ text: null, style: 'fontRightBoldTableBody', border: borderTotalGroup });
      }
      DataTemplate.push(listTotal);

    }


    //TOTALES
    //let listTotal = [];
    let LineOne = [];
    let LineTwo = [];
    let Aleatorio: Boolean = false;
    let borderTotalGroup = [false, true, false, false];
    let resources = TotalColletion(allGroupOne);

    let report = _.uniq(Object.keys(collection)).length;
    LineOne.unshift({ text: 'Resumen: ', style: 'fontLeftBoldTableGroup', border: borderTotalGroup });
    LineTwo.unshift({ text: report, style: 'fontRightBoldTableGroup', border: [false, false, false, false] });

    for (var x in resources) {
      let data = resources[x];
      Aleatorio = !Aleatorio;
      if (!Number.isNaN(Number(data))) {
        if (Aleatorio) {
          LineOne.push({ text: NumberFormat(data, FormatNumber.CURRENCY, true), style: IfNegative(Number(data), 'fontRightBoldTableGroup', 'fontRightBoldTableGroupRed'), border: borderTotalGroup })
          LineTwo.push({ text: null, border: [false, false, false, false] });
        } else if (!Aleatorio) {
          LineTwo.push({ text: NumberFormat(data, FormatNumber.CURRENCY, true), style: IfNegative(Number(data), 'fontRightBoldTableGroup', 'fontRightBoldTableGroupRed'), border: [false, false, false, false] })
          LineOne.push({ text: null, border: borderTotalGroup });
        }
        //listTotal.push({ text: NumberFormat(data, FormatNumber.CURRENCY, true), style: IfNegative(parseInt(data), 'fontRightBoldTableGroup', 'fontRightBoldTableGroupRed'), border: borderTotalGroup })
      }
    }
    //ESPACIOS VACIOS
    let CountForComplete = (ArrayCompleted, ArrayForComplete) => { return (ArrayCompleted.length - ArrayForComplete.length) < 0 ? 0 : (ArrayCompleted.length - ArrayForComplete.length); };
    let dataLenght = CountForComplete(NamesColumns, LineOne);
    for (var z = 0; z < dataLenght; z++) {
      LineOne.unshift({ text: null, border: borderTotalGroup });
      LineTwo.unshift({ text: null, border: [false, false, false, false] });
    }

    DataTemplate.push(LineOne);
    DataTemplate.push(LineTwo);



    return DataTemplate;
  }
  private TemplateReport_GroupOneExcel(collection, worksheet, FontStyles, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) {

    //GET COLUMN NAME
    let keyGroupOne = Object.keys(collection)[0];
    var NamesColumns = Object.keys(collection[keyGroupOne][0]);
    //Add Header Row
    let headerRow = worksheet.addRow(NamesColumns);
    headerRow.font = FontStyles.TableHeader.Font;
    headerRow.alignment = FontStyles.TableHeader.Alignment;
    headerRow.border = FontStyles.TableHeader.Border;

    let allGroupOne = [];

    for (let item in collection) {
      let GroupOne = collection[item];

      // ROW GROUP ONE
      let GroupOneStyle =  worksheet.addRow([item]);
      GroupOneStyle.font = FontStyles.TableGroup.Font;
      GroupOneStyle.alignment = FontStyles.TableGroup.Alignment;
      GroupOneStyle.border = FontStyles.TableGroup.Border;

      for (let key in GroupOne) {
        let selectObject = GroupOne[key];
        allGroupOne.push(selectObject);

        //VALIDANDO FECHA
        if (!isUndefined(selectObject.Fecha)) {
          let fecha = moment(selectObject.Fecha).format('DD-MMM');
          selectObject.Fecha = fecha;
        }

        //AGREGANDO DATA
        let dataForValue = Object.values(selectObject);
        let dataStyle = worksheet.addRow(dataForValue);
        dataStyle.font = FontStyles.TableBody.Font;
        dataStyle.alignment = FontStyles.TableBody.Alignment;
        dataStyle.border = FontStyles.TableBody.Border;

      }

      //TOTALES POR GRUPO DE DATA
      let listTotal = [];
      let resources = TotalColletion(GroupOne);
      //let report = _.uniq(Object.keys(collection)).length;
      //listTotal.unshift('Resumen: ' + report);

      for (var x in resources) {
        let data = resources[x];
        if (!Number.isNaN(Number(data))) {
          listTotal.push(NumberFormat(data, FormatNumber.CURRENCY, true))
        }
      }

      //ESPACIOS VACIOS
      let dataLenght = (NamesColumns.length - listTotal.length) < 0 ? 0 : (NamesColumns.length - listTotal.length);
      for (var z = 0; z < dataLenght; z++) {
        listTotal.unshift(' ');
      }
      let TotalGroups = worksheet.addRow(listTotal);
      TotalGroups.font = FontStyles.TableTotal.Font;
      TotalGroups.alignment = FontStyles.TableTotal.Alignment;
      TotalGroups.border = FontStyles.TableTotal.Border;
      //Blank Row
      worksheet.addRow([]);

    }

    //TOTALES
    let listTotal = [];
    let resources = TotalColletion(allGroupOne);
    let report = _.uniq(Object.keys(collection)).length;
    listTotal.unshift('Resumen: ' + report);

    for (var x in resources) {
      let data = resources[x];
      if (!Number.isNaN(Number(data))) {
        listTotal.push(NumberFormat(data, FormatNumber.CURRENCY, true))
      }
    }

    //ESPACIOS VACIOS
    let dataLenght = (NamesColumns.length - listTotal.length) < 0 ? 0 : (NamesColumns.length - listTotal.length);
    for (var z = 0; z < dataLenght; z++) {
      listTotal.unshift(' ');
    }
    let TotalGroups = worksheet.addRow(listTotal);
    TotalGroups.font = FontStyles.TableTotal.Font;
    TotalGroups.alignment = FontStyles.TableTotal.Alignment;
    TotalGroups.border = FontStyles.TableTotal.Border;
    //Blank Row
    worksheet.addRow([]);



  }

  private TemplateReport_BeneficiosLoteriayFechaPDF(collection, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) {
    let DataTemplate = [];
    let IfNegative = (number: number, StyleNormal: string, StyleRed: string) => { return number < 0 ? StyleRed : StyleNormal }

    //GET COLUMN NAME
    let listNamesColumns = [];
    let borderHeader = [false, true, false, true];

    let keyGroupOne = Object.keys(collection)[0];
    var NamesColumns = Object.keys(collection[keyGroupOne][0]);

    // Agregando Color a Header
    for (var i in NamesColumns) {
      listNamesColumns.push({ text: NamesColumns[i], style: 'fontCenterBoldTableHeader', border: borderHeader });
    }
    // Agregando header a la lista
    DataTemplate.push(listNamesColumns);

    let allGroupOne = [];

    for (let item in collection) {

      // ROW GROUP ONE
      let GroupOne = collection[item];
      DataTemplate.push([{ text: item, colSpan: NamesColumns.length, style: 'fontLeftBoldTableGroup', border: [false, false, false, false] }]);

      // CREATING TEMPLATE
      for (let key in GroupOne) {
        let selectObject = GroupOne[key];
        allGroupOne.push(selectObject);
        //VALIDANDO FECHA
        if (!isUndefined(selectObject.Fecha)) {
          let fecha = moment(selectObject.Fecha).format('DD-MMM');
          selectObject.Fecha = fecha;
        }
        //AGREGANDO DATA
        var listValue = [];
        let values = Object.values(selectObject);
        for (var x in values) {
          let value = values[x];

          if (value === "") {
            value = null;
          }

          let borderDataTable = [false, false, false, false];

          if (!Number.isNaN(Number(value)) && value < 0) {

            value = NumberFormat(Number(value), FormatNumber.CURRENCY, true);
            listValue.push({ text: value, style: 'fontRightBoldTableBodyRed', border: borderDataTable });

          } else if (!Number.isNaN(Number(value))) {
            value = NumberFormat(Number(value), FormatNumber.CURRENCY, true);
            listValue.push({ text: value, style: 'fontRightTableBody', border: borderDataTable });

          } else {
            listValue.push({ text: value, style: 'fontLeftTableBody', border: borderDataTable });
          }

        }
        DataTemplate.push(listValue);
      }

      //TOTALES POR GRUPO DE DATA
      let listTotal = [];
      let borderTotalGroup = [false, true, false, false];
      let resources = TotalColletion(GroupOne);

      for (var x in resources) {
        let data = resources[x];
        if (!Number.isNaN(Number(data))) {
          listTotal.push({ text: NumberFormat(data, FormatNumber.CURRENCY, true), style: IfNegative(parseInt(data), 'fontRightBoldTableBody', 'fontRightBoldTableBodyRed'), border: borderTotalGroup })
        }
      }
      //ESPACIOS VACIOS
      let dataLenght = (NamesColumns.length - listTotal.length) < 0 ? 0 : (NamesColumns.length - listTotal.length);
      for (var z = 0; z < dataLenght; z++) {
        listTotal.unshift({ text: null, style: 'fontRightBoldTableBody', border: borderTotalGroup });
      }
      DataTemplate.push(listTotal);

    }


    //TOTALES
    //let listTotal = [];
    let LineOne = [];
    let LineTwo = [];
    let Aleatorio: Boolean = false;
    let borderTotalGroup = [false, true, false, false];
    let resources = TotalColletion(allGroupOne);

    let report = _.uniq(Object.keys(collection)).length;
    LineOne.unshift({ text: 'Resumen: ', style: 'fontLeftBoldTableGroup', border: borderTotalGroup });
    LineTwo.unshift({ text: report, style: 'fontRightBoldTableGroup', border: [false, false, false, false] });

    for (var x in resources) {
      let data = resources[x];
      Aleatorio = !Aleatorio;
      if (!Number.isNaN(Number(data))) {
        if (Aleatorio) {
          LineOne.push({ text: NumberFormat(data, FormatNumber.CURRENCY, true), style: IfNegative(Number(data), 'fontRightBoldTableGroup', 'fontRightBoldTableGroupRed'), border: borderTotalGroup })
          LineTwo.push({ text: null, border: [false, false, false, false] });
        } else if (!Aleatorio) {
          LineTwo.push({ text: NumberFormat(data, FormatNumber.CURRENCY, true), style: IfNegative(Number(data), 'fontRightBoldTableGroup', 'fontRightBoldTableGroupRed'), border: [false, false, false, false] })
          LineOne.push({ text: null, border: borderTotalGroup });
        }
        //listTotal.push({ text: NumberFormat(data, FormatNumber.CURRENCY, true), style: IfNegative(parseInt(data), 'fontRightBoldTableGroup', 'fontRightBoldTableGroupRed'), border: borderTotalGroup })
      }
    }
    //ESPACIOS VACIOS
    let CountForComplete = (ArrayCompleted, ArrayForComplete) => { return (ArrayCompleted.length - ArrayForComplete.length) < 0 ? 0 : (ArrayCompleted.length - ArrayForComplete.length); };
    let dataLenght = CountForComplete(NamesColumns, LineOne);
    for (var z = 0; z < dataLenght; z++) {
      LineOne.unshift({ text: null, border: borderTotalGroup });
      LineTwo.unshift({ text: null, border: [false, false, false, false] });
    }

    DataTemplate.push(LineOne);
    DataTemplate.push(LineTwo);



    return DataTemplate;
  }
  private TemplateReport_BeneficiosLoteriayFechaEXCEL(collection, worksheet, FontStyles, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) {

    //GET COLUMN NAME
    let keyGroupOne = Object.keys(collection)[0];
    var NamesColumns = Object.keys(collection[keyGroupOne][0]);
    //Add Header Row
    let headerRow = worksheet.addRow(NamesColumns);
    headerRow.font = FontStyles.TableHeader.Font;
    headerRow.alignment = FontStyles.TableHeader.Alignment;
    headerRow.border = FontStyles.TableHeader.Border;

    let allGroupOne = [];

    for (let item in collection) {
      let GroupOne = collection[item];

      // ROW GROUP ONE
      let GroupOneStyle = worksheet.addRow([item]);
      GroupOneStyle.font = FontStyles.TableGroup.Font;
      GroupOneStyle.alignment = FontStyles.TableGroup.Alignment;
      GroupOneStyle.border = FontStyles.TableGroup.Border;

      for (let key in GroupOne) {
        let selectObject = GroupOne[key];
        allGroupOne.push(selectObject);

        //VALIDANDO FECHA
        if (!isUndefined(selectObject.Fecha)) {
          let fecha = moment(selectObject.Fecha).format('DD-MMM');
          selectObject.Fecha = fecha;
        }

        //AGREGANDO DATA
        let dataForValue = Object.values(selectObject);
        let dataStyle = worksheet.addRow(dataForValue);
        dataStyle.font = FontStyles.TableBody.Font;
        dataStyle.alignment = FontStyles.TableBody.Alignment;
        dataStyle.border = FontStyles.TableBody.Border;

      }

      //TOTALES POR GRUPO DE DATA
      let listTotal = [];
      let resources = TotalColletion(GroupOne);
      //let report = _.uniq(Object.keys(collection)).length;
      //listTotal.unshift('Resumen: ' + report);

      for (var x in resources) {
        let data = resources[x];
        if (!Number.isNaN(Number(data))) {
          listTotal.push(NumberFormat(data, FormatNumber.CURRENCY, true))
        }
      }

      //ESPACIOS VACIOS
      let dataLenght = (NamesColumns.length - listTotal.length) < 0 ? 0 : (NamesColumns.length - listTotal.length);
      for (var z = 0; z < dataLenght; z++) {
        listTotal.unshift(' ');
      }
      let TotalGroups = worksheet.addRow(listTotal);
      TotalGroups.font = FontStyles.TableTotal.Font;
      TotalGroups.alignment = FontStyles.TableTotal.Alignment;
      TotalGroups.border = FontStyles.TableTotal.Border;
      //Blank Row
      worksheet.addRow([]);

    }

    //TOTALES
    let listTotal = [];
    let resources = TotalColletion(allGroupOne);
    let report = _.uniq(Object.keys(collection)).length;
    listTotal.unshift('Resumen: ' + report);

    for (var x in resources) {
      let data = resources[x];
      if (!Number.isNaN(Number(data))) {
        listTotal.push(NumberFormat(data, FormatNumber.CURRENCY, true))
      }
    }

    //ESPACIOS VACIOS
    let dataLenght = (NamesColumns.length - listTotal.length) < 0 ? 0 : (NamesColumns.length - listTotal.length);
    for (var z = 0; z < dataLenght; z++) {
      listTotal.unshift(' ');
    }
    let TotalGroups = worksheet.addRow(listTotal);
    TotalGroups.font = FontStyles.TableTotal.Font;
    TotalGroups.alignment = FontStyles.TableTotal.Alignment;
    TotalGroups.border = FontStyles.TableTotal.Border;
    //Blank Row
    worksheet.addRow([]);



  }

  private TemplateReport_TicketNoPagadosPDF(collection, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) {
    let DataTemplate = [];
    let IfNegative = (number: number, StyleNormal: string, StyleRed: string) => { return number < 0 ? StyleRed : StyleNormal }

    //GET COLUMN NAME
    let listNamesColumns = [];
    let borderHeader = [false, true, false, true];

    let keyGroupOne = Object.keys(collection)[0];
    var NamesColumns = Object.keys(collection[keyGroupOne][0]);

    // Agregando Color a Header
    for (var i in NamesColumns) {
        listNamesColumns.push({ text: NamesColumns[i], style: 'fontCenterBoldTableHeader', border: borderHeader });
      }
    // Agregando header a la lista
    DataTemplate.push(listNamesColumns);

    let allGroupOne = [];

    for (let item in collection) {

      // ROW GROUP ONE
      let GroupOne = collection[item];
      DataTemplate.push([{ text: item, colSpan: NamesColumns.length, style: { fontSize: 10, bold: true, alignment: 'left' }, border: [false, false, false, false] }]);

      // CREATING TEMPLATE
      for (let key in GroupOne) {
        let selectObject = GroupOne[key];
        allGroupOne.push(selectObject);
        //VALIDANDO FECHA
        if (!isUndefined(selectObject['Hora'])) {
          let fecha = moment(selectObject['Hora']).format('DD-MMM HH:MM');
          selectObject['Hora'] = fecha;
        }
        //AGREGANDO DATA
        var listValue = [];

        let borderDataTable = [false, false, false, false];
        listValue.push({ text: selectObject['Ticket'], style: 'fontLeftTableBody', border: borderDataTable });     // 1
        listValue.push({ text: selectObject['Hora'], style: 'fontLeftTableBody', border: borderDataTable });       // 2
        listValue.push({ text: selectObject['Loteria'], style: 'fontLeftTableBody', border: borderDataTable });    // 3
        listValue.push({ text: NumberFormat(selectObject['Venta'], FormatNumber.CURRENCY, true), style: 'fontRightTableBody', border: borderDataTable });      // 4
        listValue.push({ text: selectObject['Premios'], style: 'fontCenterTableBody', border: borderDataTable });      // 5
        listValue.push({ text: NumberFormat(selectObject['Saco'], FormatNumber.CURRENCY, true), style: IfNegative(parseInt(selectObject['Saco']), 'fontRightBoldTableBodyRed', 'fontRightBoldTableBodyRed'), border: borderDataTable });   // 6

        DataTemplate.push(listValue);
      }

      //TOTALES POR GRUPO DE DATA
      let listTotal = [];
      let borderTotalGroup = [false, true, false, false];
      let resources = TotalColletion(GroupOne);

      listTotal.push({ text: null, style: 'fontLeftTableBody', border: borderTotalGroup });     // 1
      listTotal.push({ text: null, style: 'fontLeftTableBody', border: borderTotalGroup });       // 2
      listTotal.push({ text: null, style: 'fontLeftTableBody', border: borderTotalGroup });    // 3
      listTotal.push({ text: NumberFormat(resources['Venta'], FormatNumber.CURRENCY, true), style: 'fontRightBoldTableBody', border: borderTotalGroup });      // 4
      listTotal.push({ text: NumberFormat(GroupOne.length, FormatNumber.NORMAL, false), style: 'fontCenterBoldTableBody', border: borderTotalGroup });      // 5
      listTotal.push({ text: NumberFormat(resources['Saco'], FormatNumber.CURRENCY, true), style: IfNegative(parseInt(resources['Saco']), 'fontRightBoldTableBodyRed', 'fontRightBoldTableBodyRed'), border: borderTotalGroup });   // 6

      DataTemplate.push(listTotal);

    }


    return DataTemplate;

  }
  private TemplateReport_TicketNoPagadosEXCEL(collection, worksheet, FontStyles, NumberFormat: (numero: number, formatNumber: FormatNumber, visibleCero: boolean) => string, TotalColletion: (colletion) => any) {

    //GET COLUMN NAME
    let keyGroupOne = Object.keys(collection)[0];
    var NamesColumns = Object.keys(collection[keyGroupOne][0]);
    //Add Header Row
    let headerRow = worksheet.addRow(NamesColumns);
    headerRow.font = FontStyles.TableHeader.Font;
    headerRow.alignment = FontStyles.TableHeader.Alignment;
    headerRow.border = FontStyles.TableHeader.Border;

    let allGroupOne = [];

    for (let item in collection) {
      let GroupOne = collection[item];

      // ROW GROUP ONE
      let GroupOneStyle = worksheet.addRow([item]);
      GroupOneStyle.font = FontStyles.TableGroup.Font;
      GroupOneStyle.alignment = FontStyles.TableGroup.Alignment;
      GroupOneStyle.border = FontStyles.TableGroup.Border;

      for (let key in GroupOne) {
        let selectObject = GroupOne[key];
        allGroupOne.push(selectObject);

        //VALIDANDO FECHA
        if (!isUndefined(selectObject['Hora'])) {
          let Hora = moment(selectObject['Hora']).format('DD-MMM HH:MM');
          selectObject['Hora'] = Hora;
        }

        //AGREGANDO DATA
        let DataTable = [];
        // let dataForValue = Object.values(selectObject);

        DataTable.push(selectObject['Ticket']);    // 3
        DataTable.push(selectObject['Hora']);      // 4
        DataTable.push(selectObject['Loteria']);      // 5
        DataTable.push(NumberFormat(selectObject['Venta'], FormatNumber.CURRENCY, true));   // 6
        DataTable.push(selectObject['Premios']);   // 7
        DataTable.push(NumberFormat(selectObject['Saco'], FormatNumber.CURRENCY, true));   // 8


        let dataStyle = worksheet.addRow(DataTable);
        dataStyle.font = FontStyles.TableBody.Font;
        dataStyle.alignment = FontStyles.TableBody.Alignment;
        dataStyle.border = FontStyles.TableBody.Border;

      }

      //TOTALES POR GRUPO DE DATA
      let listTotal = [];
      let resources = TotalColletion(GroupOne);
      //let report = _.uniq(Object.keys(collection)).length;
      //listTotal.unshift('Resumen: ' + report);

      listTotal.push('');     // 1
      listTotal.push('');     // 1
      listTotal.push('');    // 3
      listTotal.push(NumberFormat(resources['Venta'], FormatNumber.CURRENCY, true));      // 4
      listTotal.push(NumberFormat(GroupOne.length, FormatNumber.NORMAL, false));      // 5
      listTotal.push(NumberFormat(resources['Saco'], FormatNumber.CURRENCY, true));     // 1

      let TotalGroups = worksheet.addRow(listTotal);
      TotalGroups.font = FontStyles.TableTotal.Font;
      TotalGroups.alignment = FontStyles.TableTotal.Alignment;
      TotalGroups.border = FontStyles.TableTotal.Border;
      //Blank Row
      worksheet.addRow([]);
    }

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
