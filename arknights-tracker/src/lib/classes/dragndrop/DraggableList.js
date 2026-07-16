export class DraggableList {
    _itemList = [];

    _draggedItemId = null;
    _enteredItemId = null;

    /**
     * @param {string[]|number[]} itemList
     */
    constructor(itemList = []) {
        this._itemList = itemList;
    }

    get itemList() {
        return this._itemList;
    }

    /**
     * @param {string[]|number[]} itemList
     */
    set itemList(itemList) {
        this._itemList = itemList;
    }

    /**
     * @returns {string|number|null}
     */
    get draggedItemId() {
        return this._draggedItemId;
    }

    /**
     * @returns {string|number|null}
     */
    get enteredItemId() {
        return this._enteredItemId;
    }

    /**
     * @param {string|number} itemId
     */
    startDrag(itemId) {
        this._draggedItemId = itemId;
    }

    endDrag() {
        this._draggedItemId = null;
    }

    /**
     * Returns true if itemList was modified else returns false
     * @param {string|number} enteredItemId
     * @returns {boolean}
     */
    onEnter(enteredItemId) {
        if (enteredItemId === this._draggedItemId) {
            return false;
        }

        if (enteredItemId === this._enteredItemId) {
            return false;
        }

        this._enteredItemId = enteredItemId;

        let draggedItemIndex = this._getItemIndex(this._draggedItemId);
        let enteredItemIndex = this._getItemIndex(enteredItemId);
        if (enteredItemIndex === -1 || draggedItemIndex === -1) {
            return false;
        }

        this._replaceItem(draggedItemIndex, enteredItemIndex);
        return true;
    }

    /**
     * @param {string|number} leavedItemId
     */
    onLeave(leavedItemId) {
        if (leavedItemId === this._draggedItemId) {
            return;
        }

        if (leavedItemId === this._enteredItemId) {
            this._enteredItemId = null;
        }
    }

    _replaceItem(oldIndex, newIndex) {
        const [replacedItem] = this._itemList.splice(oldIndex, 1);

        this._itemList.splice(newIndex, 0, replacedItem);
    }

    _getItemIndex(itemId) {
        return this._itemList
            .findIndex((item) => item.toString() === itemId.toString());
    }
}