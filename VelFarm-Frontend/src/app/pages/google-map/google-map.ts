import { Component,  AfterViewInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';

declare const google: any;
@Component({
  selector: 'app-google-map',
  standalone: false,
  templateUrl: './google-map.html',
  styleUrl: './google-map.scss'
})
export class GoogleMap implements AfterViewInit{
  constructor(private toast: ToastService) {}

  ngAfterViewInit(): void {
    this.loadGoogleMaps(() => {
      this.initMap();
    });
  }

  loadGoogleMaps(callback: () => void): void {
    if ((window as any).google) {
      // Google already loaded
      callback();
      return;
    }

    const script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAlCM_cCEgxo37p5-_GTbTB_Ce2MGWCZxQ";
    script.async = true;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);
  }

  initMap(): void {
    const mapElement = document.getElementById("map");
    if (!mapElement) {
      console.error("Map container not found.");
      return;
    }

    const defaultLocation = { lat: 0, lng: 0 };

    const map = new (window as any).google.maps.Map(mapElement, {
      center: defaultLocation,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    const marker = new (window as any).google.maps.Marker({
      position: defaultLocation,
      map: map,
      title: "You are here!"
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(userPos);
          marker.setPosition(userPos);
        },
        () => this.toast.show("Location permission denied!", 'error')
      );
    } else {
      this.toast.show("Geolocation not supported by your browser.", 'error');
    }
  }
}
