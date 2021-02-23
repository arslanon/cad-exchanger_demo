import { Component, AfterViewInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import {ModelItemFlatNode, ModelItemNode, TreeviewService} from '../shared/treeview.service';

@Component({
  selector: 'app-treeview',
  templateUrl: './treeview.component.html',
  styleUrls: ['./treeview.component.scss']
})
export class TreeviewComponent implements AfterViewInit {

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<ModelItemFlatNode, ModelItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<ModelItemNode, ModelItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: ModelItemFlatNode | null = null;

  treeControl: FlatTreeControl<ModelItemFlatNode>;

  treeFlattener: MatTreeFlattener<ModelItemNode, ModelItemFlatNode>;

  dataSource: MatTreeFlatDataSource<ModelItemNode, ModelItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<ModelItemFlatNode>(true /* multiple */);


  ngAfterViewInit(): void {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
      if (this.treeControl.dataNodes[i].item.name === 'Fruits') {
        this.todoItemSelectionToggle(this.treeControl.dataNodes[i]);
        this.treeControl.expand(this.treeControl.dataNodes[i]);
      }
      if (this.treeControl.dataNodes[i].item.name === 'Groceries') {
        this.treeControl.expand(this.treeControl.dataNodes[i]);
      }
    }
  }

  constructor(private treeviewService2: TreeviewService) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<ModelItemFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    // treeviewService2.dataChange.subscribe(data => {
    //   this.dataSource.data = data;
    // });
  }

  getLevel = (node: ModelItemFlatNode) => node.level;

  isExpandable = (node: ModelItemFlatNode) => node.expandable;

  getChildren = (node: ModelItemNode): ModelItemNode[] => Object.keys(node.children).map(id => node.children[id]);

  hasChild = (_: number, nodeData: ModelItemFlatNode) => nodeData.expandable;

  hasNoContent = (_: number, nodeData: ModelItemFlatNode) => nodeData.item === null;

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: ModelItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new ModelItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: ModelItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: ModelItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: ModelItemFlatNode): void {
    console.log(this.treeControl);
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    this.checkAllParentsSelection(node);
  }


  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: ModelItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: ModelItemFlatNode): void {
    let parent: ModelItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: ModelItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: ModelItemFlatNode): ModelItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: ModelItemFlatNode): void {
    const parentNode = this.flatNodeMap.get(node);
    // this.treeviewService2.insertItem(parentNode, null);
    this.treeControl.expand(node);
  }
}
