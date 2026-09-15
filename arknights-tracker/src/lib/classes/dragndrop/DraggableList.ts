import type { DraggableItem } from "$lib/classes/dragndrop/DraggableItem";
import type { IDraggableList } from "$lib/classes/dragndrop/IDraggableList";

export class DraggableList<TItem extends DraggableItem = DraggableItem> implements IDraggableList<TItem> {
    private _itemList: TItem[];
    private _draggedItemId: TItem | null = null;
    private _enteredItemId: TItem | null = null;

    public constructor(itemList: TItem[]) {
        this._itemList = itemList;
    }

    public get draggedItemId(): TItem | null {
        return this._draggedItemId;
    }

    public get enteredItemId(): TItem | null {
        return this._enteredItemId;
    }

    public get itemList(): TItem[] {
        return this._itemList;
    }

    public set itemList(value: TItem[]) {
        this._itemList = value;
    }

    public startDrag(itemId: TItem): void {
        this._draggedItemId = itemId;
    }

    public endDrag(): void {
        this._draggedItemId = null;
    }

    /**
     * @returns {true} If itemList was modified
     * @returns {false} If itemList was not modified
     */
    public onEnter(enteredItemId: TItem): boolean {
        if (enteredItemId === this._draggedItemId) {
            return false;
        }

        if (enteredItemId === this._enteredItemId) {
            return false;
        }

        this._enteredItemId = enteredItemId;

        let draggedItemIndex = this.getIndex(this._draggedItemId);
        let enteredItemIndex = this.getIndex(enteredItemId);

        if (enteredItemIndex === -1 || draggedItemIndex === -1) {
            return false;
        }

        this.replaceItem(draggedItemIndex, enteredItemIndex);

        return true;
    }

    public onLeave(leavedItemId: TItem): void {
        if (leavedItemId === this._draggedItemId) {
            return;
        }

        if (leavedItemId === this._enteredItemId) {
            this._enteredItemId = null;
        }
    }

    private replaceItem(oldIndex: number, newIndex: number): void {
        const [item] = this._itemList.splice(oldIndex, 1);

        this._itemList.splice(newIndex, 0, item);
    }

    private getIndex(item: TItem | null): number {
        if (item === null) {
            return -1;
        }

        return this._itemList.indexOf(item);
    }
}