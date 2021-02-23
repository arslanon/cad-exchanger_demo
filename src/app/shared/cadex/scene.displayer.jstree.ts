
export class SceneDisplayerJstree extends cadex.ModelPrs_Displayer {

  constructor(theScene, theJsTree, theRootNodeId) {
    super();
    this.scene = theScene;
    this.jsTree = theJsTree;
    this.jsTreeRootNode = this.jsTree.get_node(theRootNodeId);
  }

  display(theView3dObjects, theRepresentation, theAncestors, theDisplayMode): void{
    if (!theView3dObjects) {
      return;
    }
    this.scene.display(theView3dObjects, theDisplayMode);

    // Find corresponding tree node
    let aCurrentJsTreNode = this.jsTreeRootNode;
    for (let i = 0; i < theAncestors.length; i++) {
      const aCurrentSGE = theAncestors[i];
      let aFound = false;
      console.log(aCurrentJsTreNode);
      for (const aChildrenId of aCurrentJsTreNode.children) {
        const aNode = this.jsTree.get_node(aChildrenId);
        if (aNode.data.sge === aCurrentSGE) {
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
        alert('Unable to find tree view node by ancestors. See log for details.');
      }
    }
    // Create bidirectional binding between visual objects and tree node
    aCurrentJsTreNode.data.view3dObjects = theView3dObjects;
    theView3dObjects.forEach(theObj => {
      theObj.treeId = aCurrentJsTreNode.id;
    });
  }
}
