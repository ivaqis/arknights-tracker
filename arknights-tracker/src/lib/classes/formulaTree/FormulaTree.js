import { Miner } from "$lib/classes/buildings/Miner.js";
import { Pump } from "$lib/classes/buildings/Pump.js";
import { HubCraft } from "$lib/classes/crafts/HubCraft.js";
import { MachineCraft } from "$lib/classes/crafts/MachineCraft.js";
import { ManualCraft } from "$lib/classes/crafts/ManualCraft.js";
import { HubCraftSearcher } from "$lib/classes/crafts/searchers/HubCraftSearcher.js";
import { MachineCraftSearcher } from "$lib/classes/crafts/searchers/MachineCraftSearcher.js";
import { ManualCraftSearcher } from "$lib/classes/crafts/searchers/ManualCraftSearcher.js";
import { MinerSearcher } from "$lib/classes/crafts/searchers/MinerSearcher.js";
import { PumpSearcher } from "$lib/classes/crafts/searchers/PumpSearcher.js";
import { Item } from "$lib/classes/items/Item.js";

export class FormulaTree {
    _machineCraftSearcher = new MachineCraftSearcher();
    _manualCraftSearcher = new ManualCraftSearcher();
    _hubCraftSearcher = new HubCraftSearcher();
    _minerSearcher = new MinerSearcher();
    _pumpSearcher = new PumpSearcher();

    _maxLayer = 0;
    _maxStage = 0;

    _itemsInTree = {};

    /**
     * @type {Node}
     * @private
     */
    _startNode;

    constructor() {

    }

    /**
     * @returns {Node}
     */
    get startNode() {
        return this._startNode;
    }

    get maxLayer() {
        return this._maxLayer;
    }

    get maxStage() {
        return this._maxStage;
    }

    /**
     * @param {string} startItemId
     * @param {MachineCraft|ManualCraft|HubCraft|MiningFormula|PumpingFormula} startFormula
     */
    setStartNode(startItemId, startFormula = null) {
        this._startNode = new ItemNode(
            null,
            startItemId,
            startFormula
        );

        this.updateNode(this._startNode);
    }

    /**
     * @param {ItemNode} startNode
     */
    updateNode(startNode) {
        startNode.resetChildNodes();
        this.updateItemList();

        const stack = [startNode];

        this._itemsInTree[startNode.itemId] -= 1;

        while (stack.length > 0) {
            let node = stack.pop();

            if (node.type !== "itemNode") {
                continue;
            }

            let item = Item.getItem(node.itemId);

            if (!node.formula) {
                node.formula = this._getFirstFormula(item);
            }

            if (this.getItemUseCount(item.id) >= 1 && node !== startNode) {
                continue;
            }
            this._addItemToUsedItemList(item.id);

            let formula = node.formula;

            if (formula?.formulaType === "machineCraft"
                || formula?.formulaType === "manualCraft"
                || formula?.formulaType === "hubCraft"
            ) {
                let ingredients = formula.getIngredientItemIds();

                for (let ingredientId of ingredients) {
                    let ingredient = Item.getItem(ingredientId);

                    if (!ingredient) continue;

                    let childNode = new ItemNode(
                        node,
                        ingredientId,
                        this._getFirstFormula(ingredient)
                    );

                    node.addChildNode(childNode);
                }

                let childNodes = node.getChildNodesCopy();

                while (childNodes.length > 0) {
                    stack.push(childNodes.pop());
                }
            } else if (formula?.formulaType === "pumpingFormula") {
                let itemId = formula.pumpingLiquidId;
                let childNode = new ResourcePointNode(
                    node,
                    itemId
                );

                node.addChildNode(childNode);

            } else if (formula?.formulaType === "miningFormula") {
                let itemId = formula.miningItemId;
                let childNode = new ResourcePointNode(
                    node,
                    itemId
                );
                node.addChildNode(childNode);
            }
        }

        this.updateNodePositions();
    }

    updateItemList() {
        this._clearUsedItemList();

        for (let node of this.getIterator()) {
            if (node.type === "resourcePointNode") {
                continue;
            }

            this._addItemToUsedItemList(node.itemId);
        }
    }

    updateNodePositions() {
        let maxLayer = 0;
        let maxStage = 0;

        let startNode = this._startNode;
        startNode._selfChildIndex = null;
        startNode._layer = 0;
        startNode._stage = 0;

        const stack = [startNode];
        const minStageByLayer = {};

        let layer = 0;
        while (stack.length > 0) {
            let node = stack.pop();

            let childNodes = node.getChildNodesCopy();
            while (childNodes.length > 0) {
                let childNode = childNodes.pop();

                childNode._selfChildIndex = childNodes.length;
                stack.push(childNode);
            }

            if (node.parentNode) {
                node._stage = node.parentNode._stage + 1;
                node._layer = node.selfChildIndex === 0 ? layer : ++layer;
            }

            if (node.childNodes.length === 0) {
                while (minStageByLayer[layer-1] > node.stage && node.layer !== 0) {
                    layer--;
                    let tempNode = node;
                    node._layer = layer;

                    while (tempNode.selfChildIndex === 0) {
                        tempNode = tempNode.parentNode;
                        tempNode._layer--;
                    }
                }

                let tempNode = node;
                while (tempNode.selfChildIndex === 0) {
                    tempNode = tempNode.parentNode;
                }

                minStageByLayer[layer] = tempNode.stage;
            }

            maxLayer = Math.max(maxLayer, node._layer);
            maxStage = Math.max(maxStage, node._stage);
        }

        this._maxLayer = maxLayer;
        this._maxStage = maxStage;
    }

    /**
     * Traversing the tree in depth
     * @returns {Generator<Node, void, *>}
     */
    getIterator() {
        return this.startNode?.getIterator() ?? [];
    }

    getItemUseCount(itemId) {
        return this._itemsInTree[itemId] ?? 0;
    }

    _clearUsedItemList() {
        this._itemsInTree = {};
    }

    _addItemToUsedItemList(itemId) {
        this._itemsInTree[itemId] = this.getItemUseCount(itemId) + 1;
    }

    _isItemUsed(itemId) {
        return this._itemsInTree[itemId] > 0;
    }

    /**
     * @param {Item} item
     * @returns {MachineCraft|ManualCraft|HubCraft|MiningFormula|PumpingFormula|null}
     * @private
     */
    _getFirstFormula(item) {
        let formula;

        formula = this._getFirstMiningFormula(item.id);

        if (formula) return formula;

        if (item.subGroupId === "nature_liquid") {
            formula = this._getFirstPumpingFormula(item.id);

            if (formula) return formula;

            formula = this._getFirstMachineCraft(item.id);

            if (formula) return formula;
        } else {
            formula = this._getFirstMachineCraft(item.id);

            if (formula) return formula;

            formula = this._getFirstPumpingFormula(item.id);

            if (formula) return formula;
        }

        formula = this._getFirstManualCraft(item.id);

        if (formula) return formula;

        formula = this._getFirstHubCraft(item.id);

        if (formula) return formula;

        return null;
    }

    _getFirstMachineCraft(itemId) {
        let result = this._machineCraftSearcher.searchByItemAsOutcome(itemId);

        return result.isEmpty()
            ? null
            : MachineCraft.getMachineCraft(result.craftList[0]);
    }

    _getFirstManualCraft(itemId) {
        let result = this._manualCraftSearcher.searchByItemAsOutcome(itemId);

        return result.isEmpty()
            ? null
            : ManualCraft.getManualCraft(result.craftList[0]);
    }

    _getFirstHubCraft(itemId) {
        let result = this._hubCraftSearcher.searchByItemAsOutcome(itemId);

        return result.isEmpty()
            ? null
            : HubCraft.getHubCraft(result.craftList[0]);
    }

    _getFirstMiningFormula(itemId) {
        let result = this._minerSearcher.searchByItemAsOutcome(itemId);

        if (result.isEmpty()) return null;

        let minerId = result.buildingIdList[0];
        let miner = Miner.getMiner(minerId);

        return miner.getMiningFormula(itemId);
    }

    _getFirstPumpingFormula(itemId) {
        let result = this._pumpSearcher.searchByItemAsOutcome(itemId);

        if (result.isEmpty()) return null;

        let pumpId = result.buildingIdList[0];
        let pump = Pump.getPump(pumpId);

        return pump.getPumpingFormula(itemId);
    }
}

class Node {
    _parentNode;
    _childNodes = [];

    _selfChildIndex;
    _layer; // row
    _stage; // column

    /**
     * @param {Node} parentNode
     */
    constructor(parentNode) {
        this._parentNode = parentNode;
    }

    get type() {
        return "node";
    }

    get selfChildIndex() {
        return this._selfChildIndex;
    }

    get layer() {
        return this._layer;
    }

    get stage() {
        return this._stage;
    }

    get parentNode() {
        return this._parentNode;
    }

    get childNodes() {
        return this._childNodes;
    }

    getChildNodesCopy() {
        return [...this.childNodes];
    }

    addChildNode(node) {
        this._childNodes.push(node);
    }

    resetChildNodes() {
        this._childNodes = [];
    }

    /**
     * Traversing the tree in depth
     * @returns {Generator<Node, void, *>}
     */
    *getIterator() {
        const stack = [this];

        while (stack.length > 0) {
            let node = stack.pop();
            let childNodes = node.getChildNodesCopy();

            while (childNodes.length > 0) {
                stack.push(childNodes.pop());
            }

            yield node;
        }
    }
}

class ItemNode extends Node {
    _itemId;
    _formula;

    constructor(parentNode, itemId, formula) {
        super(parentNode);
        this._itemId = itemId;
        this._formula = formula;
    }

    get type() {
        return "itemNode"
    }

    get formula() {
        return this._formula;
    }

    set formula(formula) {
        this._formula = formula;
    }

    get itemId() {
        return this._itemId;
    }
}

class ResourcePointNode extends Node {
    _itemId;

    constructor(parentNode, itemId) {
        super(parentNode);
        this._itemId = itemId;
    }

    get type() {
        return "resourcePointNode";
    }

    get itemId() {
        return this._itemId;
    }
}