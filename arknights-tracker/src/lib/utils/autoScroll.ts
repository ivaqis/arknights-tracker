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