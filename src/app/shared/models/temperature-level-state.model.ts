
export interface TemperatureLevelStateModel {
  level: number;
  color: {
    red: number;
    green: number;
    blue: number;
  };
  temp: {
    min?: number,
    max?: number
  };
  appearance?: any;
}
