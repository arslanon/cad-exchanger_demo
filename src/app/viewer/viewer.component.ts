import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DynamicScriptLoaderService} from '../shared/dynamic-script-loader.service';
import {CadConfigModel} from '../model/cad-config.model';
import {ApiService} from '../shared/api.service';

declare var $: any;

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {

  @ViewChild('modelViewer', {static: true}) modelViewerElement: ElementRef;
  @ViewChild('modelStructure', {static: true}) modelStructureElement: ElementRef;

  aModel: any;
  aScene: any;
  aViewPort: any;
  jsTree: any;
  aJSTreeConfig = {
    core: {
      multiple: true,
      check_callback: true
    },
    types: {
      file: {
        icon: 'icon-file'
      },
      assembly: {
        icon: 'icon-assembly'
      },
      instance: {
        icon: 'icon-instance'
      },
      part: {
        icon: 'icon-part'
      }
    },
    plugins: ['wholerow', 'types']
  };

  constructor(private dynamicScriptLoaderService: DynamicScriptLoaderService,
              private apiService: ApiService) {
  }

  ngOnInit(): void {
    this.dynamicScriptLoaderService.load('cadex-bundle').then(() => {
      this.initJSTree();
      this.initViewer();
    });
  }

  initJSTree(): void {
    // noinspection JSJQueryEfficiency
    $('.model-structure').jstree(this.aJSTreeConfig)
      .on('select_node.jstree', (theEvent, theData) => this.onSelectedByTreeView(theData.node, theData.node))
      .on('deselect_node.jstree', (theEvent, theData) => this.onDeselectedByTreeView(theData.node))
      .on('deselect_all.jstree', () => this.onDeselectedAllByTreeView());
    // noinspection JSJQueryEfficiency
    this.jsTree = $('.model-structure').jstree(true);
  }

  initViewer(): void {
    // Create model
    this.aModel = new cadex.ModelData_Model();
    // Create scene and viewport
    this.aScene = new cadex.ModelPrs_Scene();
    // active a 'part' selection mode
    this.aScene.globalSelectionMode = cadex.ModelPrs_SelectionMode.Shape;
    this.aScene.addEventListener('selectionChanged', this.onSelectionChangedByScene.bind(this));

    // Create viewport with default config and div element attach to.
    this.aViewPort = new cadex.ModelPrs_ViewPort({
      showViewCube: true,
      cameraType: cadex.ModelPrs_CameraProjectionType.Perspective,
      autoResize: true
    }, this.modelViewerElement.nativeElement);

    // Attach viewport to scene
    this.aViewPort.attachToScene(this.aScene);

    const urlParams = new URLSearchParams(window.location.search);
    const model = urlParams.get('model');

    if (model) {
      this.loadAndDisplayModel(model).then();
    }
  }

  async dataLoader(theModelName, theSubFileName): Promise<ArrayBuffer> {
    const aCDXFBFileUrl = `/assets/data/cdxfb/${theModelName}.cdxfb/${theSubFileName}`;
    const aRes = await fetch(aCDXFBFileUrl);
    if (aRes.status === 200) {
      return aRes.arrayBuffer();
    }
    throw new Error(aRes.statusText);
  }

  async loadAndDisplayModel(theModelName): Promise<void> {
    try {
      const aLoadResult = await this.aModel.loadFile(theModelName, this.dataLoader, false);

      // <editor-fold desc="jsTree Instance">
      // Create root node with model name
      const aFileNode = this.jsTree.create_node(null, {
        text: theModelName,
        type: 'file'
      });
      // Populate model structure
      const aVisitor = new (await import('../shared/cadex/scene-graph.visitor')).SceneGraphVisitor(this.jsTree, aFileNode);
      await this.aModel.accept(aVisitor);
      // Expand tree view
      this.jsTree.open_all(null, 0);
      // </editor-fold>

      await cadex.ModelPrs_DisplayerApplier.apply(aLoadResult.roots, [], {
        // displayer: new cadex.ModelPrs_SceneDisplayer(this.aScene),
        displayer: new (await import('../shared/cadex/scene.displayer')).SceneDisplayer(this.aScene, this.jsTree, aFileNode),
        displayMode: cadex.ModelPrs_DisplayMode.Shaded,
        repSelector: new cadex.ModelData_RepresentationMaskSelector(
          cadex.ModelData_RepresentationMask.ModelData_RM_Poly
        )
      });

      // Auto adjust camera settings to look to whole model
      this.aViewPort.fitAll();

    } catch (theErr) {
      console.error('Unable to load and display model: ', theErr);
      alert(`Unable to load model "${theModelName}" [${theErr.message}]`);
    }
  }

  onClickFitAllButton(e: MouseEvent): void {
    this.aViewPort.fitAll();
  }

  onSelectionChangedByScene(theEvent): void {
    theEvent.added.forEach((theAdded => {
      const anAddedObject = theAdded.object;

      const aParentId = this.jsTree.get_parent(anAddedObject.treeId); // get the ID of the parent node
      const aParentNode = this.jsTree.get_node(aParentId); // get parent node
      const sge = aParentNode.data.sge; // access the corresponding ModelData_Model SGE
      const nodeName = sge.name || (sge instanceof cadex.ModelData_Instance && sge.reference.name); // get object name
      this.onPartSelected(nodeName);

      if (anAddedObject.treeId) {
        this.jsTree.select_node(anAddedObject.treeId);
      }
    }));
    theEvent.removed.forEach((theRemoved => {
      const aRemovedObject = theRemoved.object;
      if (aRemovedObject.treeId) {
        this.jsTree.deselect_node(aRemovedObject.treeId);
      }
    }));
  }

  collectLeaves(theNode): any[] {
    if (theNode.children.length === 0) {
      return [theNode];
    } else {
      return theNode.children_d.reduce((theLeaves, theChildId) => {
        const aChild = this.jsTree.get_node(theChildId);
        if (aChild.children.length === 0) {
          theLeaves.push(aChild);
        }
        return theLeaves;
      }, []);
    }
  }

  async onSelectedByTreeView(theNode, theData): Promise<void> {
    this.collectLeaves(theNode).forEach(theLeaf => {
      if (theLeaf.data.view3dObjects) {
        this.aScene.select(theLeaf.data.view3dObjects, false, false);
      }
    });

    if (theData.data && theData.data.sge) {
      const aVisitor = new (await import('../shared/cadex/element.visitor')).ElementVisitor(theData.data.textureBasePath);
      await theData.data.sge.accept(aVisitor);
    } else {
      console.log('No information available');
    }
  }

  onDeselectedByTreeView(theNode): void {
    this.collectLeaves(theNode).forEach(theLeaf => {
      if (theLeaf.data.view3dObjects) {
        this.aScene.deselect(theLeaf.data.view3dObjects);
      }
    });
  }

  onDeselectedAllByTreeView(): void {
    this.aScene.deselectAll();
  }

  onPartSelected(name: string): void {
    this.apiService.getDeviceDetails(name).subscribe((part) => {
      console.log(part);
    });
  }
}
