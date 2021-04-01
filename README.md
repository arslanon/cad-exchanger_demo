# CAD Exchanger Demo

This project uses [CAD Exchanger Web Toolkit](https://cadexchanger.com/products/web-toolkit) to display CAD files on the Web platform and 
change the appearance of the desired parts.

You can access the deployed version at the [Firebase](https://firebase.google.com) via the link below.

[Live Demo](https://cad-viewer.web.app/)

### Before using

The contents of the 3D model used in the project should be placed specified 
path `/assets/data/cdxfb/model.cdxfb/...` statically. In order to create these contents, 
it is necessary to convert the CAD file using [CAD Exchanger CLI](https://cadexchanger.com/products/cli) (an example below) or any [CAD Exchanger SDK](https://cadexchanger.com/products/sdk).

###### CLI Command

```
"...\CAD Exchanger\bin\ExchangerConv.exe" ^
  -i data\models\model.dwg ^
  -e data\cdxfb\model.cdxfb ^
  -e data\thumbnails\model.dwg.png ^
  -s data\settings.ini
```

###### settings.ini

```
[%7B7299022c-2011-4b30-962c-caaa39cbcb05%7D]
width=300
height=300
bgcolor=#f5f5f5
cameraprojection=perspective
displaymode=shaded
```

**IMPORTANT:** Both converter methods require a valid license.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
