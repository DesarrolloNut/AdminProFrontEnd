import { Component, AfterViewInit, OnInit } from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BackendService } from 'src/app/core/http/service/backend.service';
@Component({
  templateUrl: './home.component.html'
})
export class HomeComponent implements AfterViewInit, OnInit {
  subtitle: string;

  public config: PerfectScrollbarConfigInterface = {};
  constructor(  private http: BackendService) {
    this.subtitle = 'This is some text within a card block.';
  }


  ngOnInit(): void {
  }

  // This is for the dashboar line chart
  // lineChart
  public lineChartData: Array<any> = [
    { data: [0, 50, 30, 60, 180, 120, 180, 80], label: 'Sales ' },
    { data: [0, 100, 70, 100, 240, 180, 220, 140], label: 'Expense ' },
    { data: [0, 150, 110, 240, 200, 200, 300, 200], label: 'Earning ' }
  ];

  public lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Aug'];
  public lineChartOptions: any = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          },
          gridLines: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      ],
      xAxes: [
        {
          gridLines: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      ]
    },
    lineTension: 10,
    responsive: true,
    maintainAspectRatio: false
  };
  public lineChartColors: Array<any> = [
    {
      // dark grey
      backgroundColor: 'rgba(234,237,242,1)',
      borderColor: 'rgba(234,237,242,1)',
      pointBackgroundColor: 'rgba(234,237,242,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(234,237,242,1)'
    },
    {
      // grey
      backgroundColor: 'rgba(76,139,236,1)',
      borderColor: 'rgba(76,139,236,1)',
      pointBackgroundColor: 'rgba(76,139,236,1)',
      pointBorderColor: '#fff',

      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(76,139,236,1)'
    },
    {
      // grey
      backgroundColor: 'rgba(117,91,241,1)',
      borderColor: 'rgba(117,91,241,1)',
      pointBackgroundColor: 'rgba(117,91,241,1)',
      pointBorderColor: '#fff',

      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(117,91,241,1)'
    }
  ];
  public lineChartLegend = false;
  public lineChartType = 'line';

  // Doughnut
  public doughnutChartLabels: string[] = ['Tablet', 'Desktop', 'Mobile', 'Other'];
  public doughnutChartOptions: any = {
    borderWidth: 2,
    maintainAspectRatio: false
  };
  public doughnutChartData: number[] = [150, 450, 200, 20];
  public doughnutChartType = 'doughnut';
  public doughnutChartLegend = false;


  recentcomments: Object[] = [
    {
      image: 'assets/images/users/1.jpg',
      name: 'James Anderson',
      comment:
        // tslint:disable-next-line:max-line-length
        'Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has beenorem Ipsum is simply dummy text of the printing and type setting industry.',
      date: 'April 14, 2016',
      status: 'Pending',
      labelcolor: 'badge-light-info text-info'
    },
    {
      image: 'assets/images/users/2.jpg',
      name: 'Michael Jorden',
      comment:
        // tslint:disable-next-line:max-line-length
        'Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has beenorem Ipsum is simply dummy text of the printing and type setting industry.',
      date: 'April 14, 2016',
      status: 'Approved',
      labelcolor: 'badge-light-success text-success'
    },
    {
      image: 'assets/images/users/4.jpg',
      name: 'Johnathan Doeting',
      comment:
        // tslint:disable-next-line:max-line-length
        'Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has beenorem Ipsum is simply dummy text of the printing and type setting industry.',
      date: 'April 14, 2016',
      status: 'Rejected',
      labelcolor: 'badge-light-danger text-danger'
    },
    {
      image: 'assets/images/users/5.jpg',
      name: 'James Anderson',
      comment:
        // tslint:disable-next-line:max-line-length
        'Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has beenorem Ipsum is simply dummy text of the printing and type setting industry.',
      date: 'April 14, 2016',
      status: 'Pending',
      labelcolor: 'badge-light-info text-info'
    },
    {
      image: 'assets/images/users/1.jpg',
      name: 'Henry Cristian',
      comment:
        // tslint:disable-next-line:max-line-length
        'Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has beenorem Ipsum is simply dummy text of the printing and type setting industry.',
      date: 'April 14, 2016',
      status: 'Pending',
      labelcolor: 'badge-light-info text-info'
    },
    {
      image: 'assets/images/users/2.jpg',
      name: 'Richard Penderson',
      comment:
        // tslint:disable-next-line:max-line-length
        'Lorem Ipsum is simply dummy text of the printing and type setting industry. Lorem Ipsum has beenorem Ipsum is simply dummy text of the printing and type setting industry.',
      date: 'April 14, 2016',
      status: 'Pending',
      labelcolor: 'badge-light-info text-info'
    },
  ];

  

  ngAfterViewInit() { }
}
