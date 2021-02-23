import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ApiService} from '../shared/api.service';
import {TreeviewService} from '../shared/treeview.service';
import {TemperatureLevelStateModel, TemperatureLevelStateService} from '../shared/temperature-level-state.service';
import {BehaviorSubject} from 'rxjs';
import {ChartComponent} from 'ng-apexcharts';
import {ApexChartOptions} from '../model/apex-chart.type';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [TemperatureLevelStateService]
})
export class MainComponent implements OnInit {

  @ViewChild('modelViewer', {static: true}) modelViewerElement: ElementRef;
  @ViewChild('chart', {static: false}) chart: ChartComponent;

  theModelName: string;
  aModel: any;
  aScene: any;
  aViewPort: any;

  cadConfigDefaultAppearance: any;
  deviceTemperaturesCurrent$ = new BehaviorSubject<{
    [name: string]: TemperatureLevelStateModel[]
  }>({});

  selectedDeviceName: string | null;
  deviceDetails$ = new BehaviorSubject<{key: string, value: string | number}[]>([]);
  chartOptions: Partial<ApexChartOptions> = {
    series: [
      {
        name: 'Temperatures C°',
        data: []
      }
    ],
    chart: {
      height: 300,
      type: 'line',
      zoom: {
        enabled: false
      }
    },
    colors: ['#ea7784'],
    dataLabels: {
      enabled: true
    },
    stroke: {
      curve: 'smooth'
    },
    title: {
      text: 'Old Temperatures C°',
      align: 'center'
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      }
    },
    xAxis: {
      labels: {
        show: false
      }
    }
  };

  constructor(private apiService: ApiService,
              private treeViewService: TreeviewService,
              private temperatureLevelStateService: TemperatureLevelStateService) {
  }

  ngOnInit(): void {
    this.cadConfigDefaultAppearance = new cadex.ModelData_Appearance(
      new cadex.ModelData_MaterialObject(
        new cadex.ModelData_ColorObject(199 / 255, 145 / 255, 29 / 255, 1.00),
        new cadex.ModelData_ColorObject(199 / 255, 145 / 255, 29 / 255, 1.00),
        new cadex.ModelData_ColorObject(215 / 255, 173 / 255, 81 / 255, 1.00),
        new cadex.ModelData_ColorObject(0, 0, 0, 1.00),
        15
      )
    );

    const urlParams = new URLSearchParams(window.location.search);
    this.theModelName = urlParams.get('model');

    if (this.theModelName) {

      // Create viewport with default config and div element attach to.
      this.aViewPort = new cadex.ModelPrs_ViewPort({
        showViewCube: true,
        cameraType: cadex.ModelPrs_CameraProjectionType.Perspective,
        autoResize: true
      }, this.modelViewerElement.nativeElement);

      this.fetchDataAndInitView();
    }
  }

  fetchDataAndInitView(): void {
    this.apiService.randomizeData();
    this.apiService.getDeviceTemperatures().subscribe(async (dts) => {
      this.deviceTemperaturesCurrent$.next(
        dts.reduce((acc, dt) => ({
          ...acc,
          [dt.name]: this.temperatureLevelStateService.getAppearancesWithSubLevels(dt.temperature)
        }), {})
      );
      this.refreshViewer().then();
    });
  }

  async refreshViewer(): Promise<void> {
    if (this.aScene) {
      this.aScene.removeAll();
    }

    // Create scene and viewport
    this.aScene = new cadex.ModelPrs_Scene();
    this.aScene.globalSelectionMode = cadex.ModelPrs_SelectionMode.Shape;
    this.aScene.addEventListener('selectionChanged', this.onSelectionChangedByScene.bind(this));

    // Attach viewport to scene
    this.aViewPort.attachToScene(this.aScene);

    try {
      // Create model
      this.aModel = new cadex.ModelData_Model();

      const aLoadResult = await this.aModel.loadFile(
        this.theModelName,
        async (theModelName, theSubFileName) => {
            const aCDXFBFileUrl = `/assets/data/cdxfb/${theModelName}.cdxfb/${theSubFileName}`;
            const aRes = await fetch(aCDXFBFileUrl);
            if (aRes.status === 200) {
              return aRes.arrayBuffer();
            }
            throw new Error(aRes.statusText);
        },
        false);

      const rootNode = this.treeViewService.insertNode(null, {
        name: this.theModelName,
        type: 'file'
      });
      const aVisitor = new (await import('../shared/cadex/scene-graph.visitor')).SceneGraphVisitor(this.treeViewService, rootNode);
      await this.aModel.accept(aVisitor);

      // <editor-fold desc="Custom dyeing">
      Object.entries(this.deviceTemperaturesCurrent$.value).forEach(([name, states]) => {
        aLoadResult.roots[0].children = aLoadResult.roots[0].children
          .map(c => {
            if (c.da?.name?.includes(`@${name}@`)) {
              c.appearance = states[0].appearance;
            }
            return c;
          });
      });

      await cadex.ModelPrs_DisplayerApplier.apply(aLoadResult.roots, [], {
        displayer: new (await import('../shared/cadex/scene.displayer')).SceneDisplayer(this.aScene, this.treeViewService, rootNode),
        displayMode: cadex.ModelPrs_DisplayMode.Shaded,
        repSelector: new cadex.ModelData_RepresentationMaskSelector(
          cadex.ModelData_RepresentationMask.ModelData_RM_Poly
        )
      });

      // Auto adjust camera settings to look to whole model
      this.aViewPort.fitAll();

    } catch (theErr) {
      console.error('Unable to load and display model: ', theErr);
      alert(`Unable to load model "${this.theModelName}" [${theErr.message}]`);
    }
  }

  onClickFitAllButton(): void {
    this.aViewPort.fitAll();
  }

  onSelectionChangedByScene(theEvent): void {
    this.selectedDeviceName = null;
    theEvent.added.forEach((theAdded => {
      const anAddedObject = theAdded.object;
      const parentNode = this.treeViewService.getParent(anAddedObject.treeId);
      if (parentNode) {
        this.onPartSelected(parentNode.item.name);
      }
    }));
  }

  onPartSelected(name: string): void {
    this.apiService.getDeviceDetails(name).subscribe((deviceTemperatureDetails) => {
      if (deviceTemperatureDetails) {
        this.selectedDeviceName = deviceTemperatureDetails.name;

        this.deviceDetails$.next([
          ...[],
          {key: 'Name', value: deviceTemperatureDetails.name},
          {key: 'Temperature C°', value: deviceTemperatureDetails.temperature},
        ]);

        this.chartOptions.series = [{
          name: 'Temperature C°',
          data: deviceTemperatureDetails.temperatures
        }];
        this.chartOptions.xAxis = {
          categories: deviceTemperatureDetails.temperatures.map((t) => ''),
          labels: {
            show: false
          }
        };
      }
    });
  }
}
