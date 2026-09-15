import type { DraggableItem } from "$lib/classes/dragndrop/DraggableItem";

export interface IDraggableList<TItem extends DraggableItem = DraggableItem> {
    get itemList(): TItem[];
    set itemList(itemList: TItem[]);
    get draggedItemId(): TItem | null;
    get enteredItemId(): TItem | null;

    startDrag(itemId: TItem): void;
    endDrag(): void;
    onEnter(enteredItemId: TItem): boolean;
    onLeave(leavedItemId: TItem): void;
}