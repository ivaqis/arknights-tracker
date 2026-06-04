import {MachineCraftSearcher} from "$lib/classes/crafts/searchers/MachineCraftSearcher.js";
import {ManualCraftSearcher} from "$lib/classes/crafts/searchers/ManualCraftSearcher.js";
import {HubCraftSearcher} from "$lib/classes/crafts/searchers/HubCraftSearcher.js";
import {MinerSearcher} from "$lib/classes/crafts/searchers/MinerSearcher.js";
import {PumpSearcher} from "$lib/classes/crafts/searchers/PumpSearcher.js";
import {Miner} from "$lib/classes/buildings/Miner.js";
import {Pump} from "$lib/classes/buildings/Pump.js";
import {MachineCraft} from "$lib/classes/crafts/MachineCraft.js";
import {ManualCraft} from "$lib/classes/crafts/ManualCraft.js";
import {HubCraft} from "$lib/classes/crafts/HubCraft.js";
import {Item} from "$lib/classes/items/Item.js";

export class FormulaTree {
    _machineCraftSearcher = new MachineCraftSearcher();
    _manualCraftSearcher = new ManualCraftSearcher();
    _hubCraftSearcher = new HubCraftSearcher();
    _minerSearcher = new MinerSearcher();
    _pumpSearcher = new PumpSearcher();

    _itemsInTree = new Set();

    _startNode;

    constructor() {

    }

    /**
     *
     * @returns {Node}
     */
    get startNode() {
        return this._startNode;
    }

    /**
     *
     * @param {string} startItemId
     * @param {MachineCraft|ManualCraft|HubCraft|MiningFormula|PumpingFormula} startFormula
     */
    setStartNode(startItemId, startFormula = null) {
        this._startNode = new Node(
            startFormula,
            startItemId,
            null
        );

        this.updateNode(this._startNode);
    }

    /**
     *
     * @param {Node} startNode
     */
    updateNode(startNode) {
        startNode.resetChildNodes();
        this.updateItemList();

        const stack = [startNode];

        while (stack.length > 0) {
            let node = stack.pop();
            let item = Item.getItem(node.itemId);

            if (!node.formula) {
                node.formula = this._getFirstFormula(item);
            }

            if (this._isItemUsed(item.id)) continue;
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

                    let childNode = new Node(
                        this._getFirstFormula(ingredient),
                        ingredientId,
                        node
                    );

                    node.addChildNode(childNode);
                }
            }
        }
    }

    updateItemList() {
        this._clearUsedItemList();

        const stack = [this._startNode];

        while (stack.length > 0) {
            let node = stack.pop();

            let childNodes = node.getChildNodesCopy();
            while (childNodes.length > 0) {
                stack.push(childNodes.pop());
            }

            this._addItemToUsedItemList(node.itemId);
        }
    }

    _clearUsedItemList() {
        this._itemsInTree.clear();
    }

    _addItemToUsedItemList(itemId) {
        this._itemsInTree.add(itemId);
    }

    _isItemUsed(itemId) {
        return this._itemsInTree.has(itemId);
    }

    /**
     *
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
    _formula;
    _itemId;

    _parentNode;
    _childNodes = [];

    /**
     *
     * @param {MachineCraft|ManualCraft|HubCraft|MiningFormula|PumpingFormula|null} formula
     * @param {string} itemId
     * @param {Node} parentNode
     */
    constructor(formula, itemId, parentNode) {
        this._formula = formula;
        this._itemId = itemId;
        this._parentNode = parentNode;
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
}