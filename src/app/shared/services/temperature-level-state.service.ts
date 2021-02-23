import {Injectable} from '@angular/core';
import {TemperatureLevelStateModel} from '../models/temperature-level-state.model';

const temperatureLevelStateConfig: TemperatureLevelStateModel[] = [
    {level: 0, color: {red: 0, green: 212, blue: 255}, temp: {max: 0}},
    {level: 1, color: {red: 0, green: 255, blue: 54}, temp: {min: 0, max: 15}},
    {level: 2, color: {red: 215, green: 255, blue: 0}, temp: {min: 15, max: 25}},
    {level: 3, color: {red: 255, green: 210, blue: 0}, temp: {min: 25, max: 35}},
    {level: 4, color: {red: 255, green: 120, blue: 0}, temp: {min: 35, max: 45}},
    {level: 5, color: {red: 255, green: 0, blue: 0}, temp: {min: 45}}
];

@Injectable()
export class TemperatureLevelStateService {

  /**
   * Constructor
   * Set cadex color objects into configs
   */
  constructor() {
    temperatureLevelStateConfig.forEach((state: TemperatureLevelStateModel) => {
      const [red, green, blue] = [state.color.red / 255, state.color.green / 255, state.color.blue / 255];
      state.appearance = new cadex.ModelData_Appearance(
        new cadex.ModelData_MaterialObject(
          new cadex.ModelData_ColorObject(red, green, blue, 1.00),
          new cadex.ModelData_ColorObject(red, green, blue, 1.00),
          new cadex.ModelData_ColorObject(red, green, blue, 1.00),
          new cadex.ModelData_ColorObject(0, 0, 0, 1.00),
          15
        )
      );
    });
  }

  /**
   * Get state object according to temp with sub states
   * @param temp: number
   * @return TemperatureLevelStateModel[]
   */
  getAppearancesWithSubLevels(temp: number): TemperatureLevelStateModel[] {

    const temperatureLevel = temperatureLevelStateConfig.find(s =>
      ((!s.temp.min && s.temp.min !== 0) || s.temp.min < temp) && ((!s.temp.max && s.temp.max !== 0) || s.temp.max >= temp)
    );

    if (temperatureLevel) {
      const levels: TemperatureLevelStateModel[] = [
        temperatureLevel,
        ...temperatureLevelStateConfig.filter(s => s.level < temperatureLevel.level)
      ];
      levels.sort((s1, s2) => s2.level - s1.level);
      return levels;
    }

    return [];
  }

}
