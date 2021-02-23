import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {PartModel} from '../model/part.model';
import {DeviceTemperatureModel} from '../model/device-temperature.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  devices = [
    'Sensor1',
    'Sensor2',
    'Sensor3',
    'Sensor4',
    'Sensor5',
    'Sensor6',
  ];

  data: DeviceTemperatureModel[] = [];

  randomizeData(): void {
    this.data = this.devices.map((s) => {
      const currentTemperature = Math.round(Math.random() * 60);
      return {
        name: s,
        temperature: currentTemperature,
        temperatures: [
          Math.round(Math.random() * 60),
          Math.round(Math.random() * 45),
          Math.round(Math.random() * 30),
          Math.round(Math.random() * 50),
          Math.round(Math.random() * 60),
          Math.round(Math.random() * 40),
          Math.round(Math.random() * 20),
          Math.round(Math.random() * 55),
          currentTemperature
        ]
      };
    });
  }

  getDeviceDetails(name: string): Observable<DeviceTemperatureModel> {
    return of(this.data.find(d => name?.includes(`@${d.name}@`)));
  }

  getDeviceTemperatures(): Observable<DeviceTemperatureModel[]> {
    return of(this.data);
  }
}
