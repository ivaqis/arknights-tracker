import { sleep } from "$lib/utils/asyncUtils";

/**
 * @property delay Delay between attempts in ms. Default: 50
 * @property attempts Default: 30
 * @property loadFn Function to load new elements after failed attempt
 */
export interface AutoScrollOptions {
    delay?: number;
    attempts?: number;
    loadFn?: () => void | Promise<void>;
    scrollParams?: ScrollIntoViewOptions;
}

export async function autoScroll(getElementFn: () => HTMLElement | null, options?: AutoScrollOptions): Promise<boolean> {
    const attempts = options?.attempts ?? 30;
    const delay = options?.delay ?? 50;
    const load = options?.loadFn;
    const scrollParams = options?.scrollParams ?? {
        behavior: "smooth",
        block: "center",
        inline: "center"
    };

    for (let i = 0; i < attempts; i++) {
        const element = getElementFn();

        if (element) {
            element.scrollIntoView(scrollParams);

            return true;
        }

        await load?.();
        await sleep(delay);
    }

    const element = getElementFn();

    if (element) {
        element.scrollIntoView(scrollParams);

        return true;
    }

    return false;
}

export function scrollHorizontalPeek(
    container: HTMLElement | null | undefined,
    itemOrSelector: HTMLElement | string | null | undefined,
    peekRatio: number = 0.5,
    gap: number = 4
): void {
    if (!container || !itemOrSelector) return;

    const item = typeof itemOrSelector === "string"
        ? container.querySelector(itemOrSelector) as HTMLElement | null
        : itemOrSelector;

    if (!item) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const currentScroll = container.scrollLeft;

    const nextElem = item.nextElementSibling as HTMLElement | null;
    const prevElem = item.previousElementSibling as HTMLElement | null;

    const nextWidth = nextElem ? nextElem.getBoundingClientRect().width : itemRect.width;
    const prevWidth = prevElem ? prevElem.getBoundingClientRect().width : itemRect.width;

    const peekDistanceRight = nextWidth * peekRatio + gap;
    const peekDistanceLeft = prevWidth * peekRatio + gap;

    const leftEdge = itemRect.left - containerRect.left;
    const rightEdge = containerRect.right - itemRect.right;

    let targetScroll = currentScroll;

    if (item === container.firstElementChild) {
        targetScroll = 0;
    } else if (item === container.lastElementChild) {
        if (rightEdge < gap) {
            targetScroll = currentScroll + (gap - rightEdge);
        }
    } else if (rightEdge < peekDistanceRight) {
        targetScroll = currentScroll + (peekDistanceRight - rightEdge);
    } else if (leftEdge < peekDistanceLeft) {
        targetScroll = currentScroll - (peekDistanceLeft - leftEdge);
    }

    if (Math.abs(targetScroll - currentScroll) > 1) {
        container.scrollTo({
            left: targetScroll,
            behavior: "smooth"
        });
    }
}
