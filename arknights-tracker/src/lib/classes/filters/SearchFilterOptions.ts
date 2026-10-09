export interface SearchFilterOptions {
    ignoreCase?: boolean; // true by default
    normalize?: boolean; // true bt default
    normalizeForm?: "NFC" | "NFD" | "NFKC" | "NFKD"; // NFKD by default
}
