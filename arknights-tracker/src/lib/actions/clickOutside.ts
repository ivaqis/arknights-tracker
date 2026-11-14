export function clickOutside(node: HTMLElement, onOutside?: () => void) {
    const handleClick = (event: MouseEvent) => {
        if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
            if (onOutside) {
                onOutside();
            } else {
                node.dispatchEvent(new CustomEvent("outclick"));
            }
        }
    };
    document.addEventListener("click", handleClick, true);
    return {
        destroy() {
            document.removeEventListener("click", handleClick, true);
        }
    };
}

