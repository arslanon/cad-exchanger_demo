import {TreeviewService, TreeItem, ModelItemNode} from '../treeview.service';

export class SceneGraphVisitor extends cadex.ModelData_SceneGraphElementVisitor {

  treeViewService: TreeviewService;
  treeNodes: ModelItemNode[];

  constructor(treeViewService: TreeviewService,
              rootNode: ModelItemNode) {
    super();
    this.treeViewService = treeViewService;
    this.treeNodes = [rootNode];
    this.lastInstance = null;
  }

  currentNode(): ModelItemNode {
    return this.treeNodes[this.treeNodes.length - 1];
  }

  visitPart(thePart): void {
    const aTreeItem: TreeItem = {
      name: (this.lastInstance && this.lastInstance.name) || thePart.name || 'Unnamed Part',
      type: 'part',
      data: {
        sge: this.lastInstance || thePart,
        view3dObjects: null
      }
    };
    this.treeViewService.insertNode(this.currentNode(), aTreeItem);
  }

  visitInstanceEnter(theInstance): boolean {
    this.lastInstance = theInstance;
    return true;
  }

  visitInstanceLeave(): void {
    this.lastInstance = null;
  }

  visitAssemblyEnter(theAssembly): boolean {
    const aTreeItem: TreeItem = {
      name: (this.lastInstance && this.lastInstance.name) || theAssembly.name || 'Unnamed Assembly',
      type: 'assembly',
      data: {
        sge: this.lastInstance || theAssembly,
        view3dObjects: null
      }
    };
    const aNode = this.treeViewService.insertNode(this.currentNode(), aTreeItem);
    this.treeNodes.push(aNode);
    return true;
  }

  visitAssemblyLeave(): void {
    this.treeNodes.pop();
  }
}
