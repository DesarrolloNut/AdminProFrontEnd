import { MapsAPILoader } from '@agm/core';
import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Coordenadas } from '../models/Cliente';
declare var google;

@Component({
  selector: 'app-cliente-map',
  templateUrl: './cliente-map.component.html',
  styleUrls: ['./cliente-map.component.scss']
})
export class ClienteMapComponent implements OnInit {

  public searchControl: FormControl;
  public zoom: number;

  @Input() latitud :number;
  @Input() longitud :number;


  @Input() fillCoords: EventEmitter<Coordenadas>;
  @ViewChild('search', {static: true}) public searchElementRef: ElementRef;

  markers: marker[] = [{lng:0,lat:0,label:'Cliente',draggable:true},]
  @Output() markerOne = new EventEmitter();

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone) { }

  
  ngOnInit() {
      

    this.fillCoords.subscribe(co => {
      if(co.latitud==0 && co.longitud){
         this.setCurrentPosition();
      }
      console.log(co);
      this.markers[0].lat = co.latitud;
      this.latitud= co.latitud;
      this.markers[0].lng = co.longitud;
      this.longitud= co.longitud;
      console.log(co)
     })
       //set google maps defaults
        this.zoom = 15;
        /* this.latitude = 39.8282;
        this.longitude = -98.5795; */
    
        //create search FormControl
        this.searchControl = new FormControl();
    
        //set current position
        // this.recenterMap()
    
        //load Places Autocomplete
        this.mapsAPILoader.load().then(() => {
          let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
            types: ["address"]
          });
          autocomplete.addListener("place_changed", () => {
            this.ngZone.run(() => {
              //get the place result
              let place= autocomplete.getPlace();
    
              //verify result
              if (place.geometry === undefined || place.geometry === null) {
                return;
              }
    
              //set latitude, longitude and zoom
              this.latitud = place.geometry.location.lat();
              this.longitud = place.geometry.location.lng();
              this.zoom = 12;
            });
          });
        });
  }
  recenterMap(){
    this.latitud = 36.8392542;
    this.longitud = 10.313922699999999;
  }
  
  private setCurrentPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitud = position.coords.latitude;
        this.longitud = position.coords.longitude;
        this.zoom = 15;
        console.log(this.latitud, this.longitud);
      });
    }
  }
  
  getPosition(){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {        
    this.longitud=position.coords.latitude+(0.0000000000100*Math.random());
    this.longitud=position.coords.longitude+(0.0000000000100*Math.random());
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
   }
   mapReady(event) {
    console.log(event);
    this.setCurrentPosition();
  }

  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`)
  }
  
  mapClicked($event) {
    this.markers =[];
    this.markers.push({
      lat: $event.coords.lat,
      lng: $event.coords.lng,
      label:'Cliente',
      draggable: true
    });
    
    console.log($event)
    this.markerOne.emit($event.coords)
  }
  
  markerDragEnd(m: marker, $event: MouseEvent) {
    console.log('dragEnd', m, $event);
  }
}
interface marker {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
}
