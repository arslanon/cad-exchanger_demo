import {ModelItemNode, TreeviewService} from '../services/treeview.service';

export class SceneDisplayer extends cadex.ModelPrs_Displayer {

  treeViewService: TreeviewService;
  jsTreeRootNode: ModelItemNode;

  constructor(theScene,
              treeViewService: TreeviewService,
              rootNode: ModelItemNode) {
    super();
    this.scene = theScene;
    this.treeViewService = treeViewService;
    this.jsTreeRootNode = rootNode;
  }

  display(theView3dObjects, theRepresentation, theAncestors, theDisplayMode): void {
    if (!theView3dObjects) {
      return;
    }
    this.scene.display(theView3dObjects, theDisplayMode);
    // Find corresponding tree node
    let aCurrentJsTreNode = this.jsTreeRootNode;
    for (let i = 0; i < theAncestors.length; i++) {
      const aCurrentSGE = theAncestors[i];
      let aFound = false;
      for (const aChildrenId of (Object.keys(aCurrentJsTreNode.children))) {
        const aNode = aCurrentJsTreNode.children[aChildrenId];
        if (aNode.item.data.sge === aCurrentSGE) {
          aFound = true;
          aCurrentJsTreNode = aNode;
          if (aCurrentSGE instanceof cadex.ModelData_Instance) {
            i++;
          }
          break;
        }
      }
      if (!aFound) {
        console.error('Unable to find tree view node by path', theAncestors);
        // eslint-disable-next-line no-alert
        // alert('Unable to find tree view node by ancestors. See log for details.');
      }
    }
    // Create bidirectional binding between visual objects and tree node
    aCurrentJsTreNode.item.data.view3dObjects = theView3dObjects;
    theView3dObjects.forEach(theObj => {
      theObj.treeId = aCurrentJsTreNode.id;
    });
  }
}
