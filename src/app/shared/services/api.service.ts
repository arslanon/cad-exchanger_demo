import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {DeviceTemperatureModel} from '../models/device-temperature.model';

@Injectable()
export class ApiService {

  devices = [
    'Sensor1',
    'Sensor2',
    'Sensor3',
    'Sensor4',
    'Sensor5',
    'Sensor6',
    'Sensor7',
    'Sensor8',
    'Sensor9',
    'Sensor10',
    'Sensor11',
    'Sensor12',
    'Sensor13',
    'Sensor14',
    'Sensor15',
    'Sensor16',
    'Sensor17',
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
          Math.round(Math.random() * 10),
          Math.round(Math.random() * 40),
          Math.round(Math.random() * 20),
          Math.round(Math.random() * 55),
          currentTemperature
        ]
      };
    });
  }

  /**
   * Get device details by name
   * @param name: string
   * @return Observable<DeviceTemperatureModel>
   */
  getDeviceDetails(name: string): Observable<DeviceTemperatureModel> {
    return of(this.data.find(d => name?.includes(`@${d.name}@`)));
  }

  /**
   * Get all device data after randomize it
   * @return Observable<DeviceTemperatureModel[]>
   */
  getDeviceTemperatures(): Observable<DeviceTemperatureModel[]> {
    this.randomizeData();
    return of(this.data);
  }
}
