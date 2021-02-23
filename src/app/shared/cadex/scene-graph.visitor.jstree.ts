
export class SceneGraphVisitorJstree extends cadex.ModelData_SceneGraphElementVisitor {

  constructor(theJsTree, theRootNodeId) {
    super();
    this.jsTree = theJsTree;
    this.jsTreeNodes = [theRootNodeId];
    this.lastInstance = null;
  }

  currentNode(): any {
    return this.jsTreeNodes[this.jsTreeNodes.length - 1];
  }

  visitPart(thePart): void {
    const aTreeItem = {
      text: (this.lastInstance && this.lastInstance.name) || thePart.name || 'Unnamed Part',
      type: 'part',
      data: {
        sge: this.lastInstance || thePart
      }
    };
    this.jsTree.create_node(this.currentNode(), aTreeItem);
  }

  visitInstanceEnter(theInstance): boolean {
    this.lastInstance = theInstance;
    return true;
  }

  visitInstanceLeave(): void {
    this.lastInstance = null;
  }

  visitAssemblyEnter(theAssembly): boolean {
    const aTreeItem = {
      text: (this.lastInstance && this.lastInstance.name) || theAssembly.name || 'Unnamed Assembly',
      type: 'assembly',
      data: {
        sge: this.lastInstance || theAssembly
      }
    };
    const aNode = this.jsTree.create_node(this.currentNode(), aTreeItem);
    this.jsTreeNodes.push(aNode);
    return true;
  }

  visitAssemblyLeave(): void {
    this.jsTreeNodes.pop();
  }

}
