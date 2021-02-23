import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import * as uuid from 'uuid';

export class TreeItem {
  name: string;
  type: string;
  data?: {
    sge: any,
    view3dObjects: any
  };
}

export class ModelItemNode {
  id: string;
  item: TreeItem;
  children?: {[id: string]: ModelItemNode};
  parent?: ModelItemNode;
}

@Injectable()
export class TreeviewService {

  private tree$ = new BehaviorSubject<{[id: string]: ModelItemNode}>({});
  private relations$ = new BehaviorSubject<{[id: string]: ModelItemNode}>({});

  get getTree(): {[id: string]: ModelItemNode} { return this.tree$.value; }
  get getRelations(): {[id: string]: ModelItemNode} { return this.relations$.value; }

  /**
   * Constructor
   */
  constructor() {
    this.tree$.next({});
  }

  /**
   * Add a node
   * If parent exists, build a new tree with new parent
   * @param parent: ModelItemNode
   * @param item: TreeItem
   * @return ModelItemNode
   */
  insertNode(parent: ModelItemNode, item: TreeItem): ModelItemNode {
    const node: ModelItemNode = {id: uuid.v4(), item, children: {}};

    if (parent && parent.children) {
      parent.children[node.id] = node;
      this.tree$.next(this.getTree);
      this.addRelation(node.id, parent);
    } else {
      this.tree$.next({...{}, [node.id]: node});
      this.relations$.next({});
    }

    return node;
  }

  /**
   * Add a relation
   * @param childId: string
   * @param parent: ModelItemNode
   */
  addRelation(childId: string, parent: ModelItemNode): void {
    this.relations$.next({
      ...this.getRelations,
      [childId]: parent
    });
  }

  /**
   * Get parent node from relations
   * @param nodeId: string
   * @return ModelItemNode | undefined
   */
  getParent(nodeId: string): ModelItemNode | undefined {
    return this.getRelations[nodeId];
  }
}
