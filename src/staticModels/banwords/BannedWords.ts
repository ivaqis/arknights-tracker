import { logger } from "@/logger.js";

export class BannedWords {
    private readonly _words: Set<string>;
    private readonly _roots: string[];

    public constructor(wordsList: string[], rootsList: string[]) {
        this._words = new Set(wordsList);
        this._roots = rootsList;

        logger.info(`BannedWords: init completed: (words: ${this._words.size}, roots: ${this._roots.length})`);
    }

    private static prepare(str: string): string {
        return str
            .trim()
            .toLowerCase()
            .replace(/1/g, 'i')
            .replace(/3/g, 'e')
            .replace(/4/g, 'a')
            .replace(/0/g, 'o')
            .replace(/@/g, 'a')
            .replace(/5/g, 's');
    }

    private static normalize(str: string): string {
        return this.prepare(str)
            .replace(/[^a-z]/g, "");
    }

    private static getTokens(str: string): string[] {
        const prepared = this.prepare(str);

        return prepared
            .split(/[^a-z]+/)
            .filter(Boolean);
    }

    public isBannedWord(word: string): boolean {
        const normalized = BannedWords.normalize(word);

        return this.isBannedWordNormalized(normalized);
    }

    public containsBannedWord(str: string): boolean {
        const tokens = BannedWords.getTokens(str);

        const isAnyWord = tokens.some(token => this.isBannedWordNormalized(token));

        if (isAnyWord) {
            return true;
        }

        const normalized = BannedWords.normalize(str);

        return this.containsBannedWordNormalized(normalized);
    }

    public containsBannedRoot(str: string): boolean {
        const normalized = BannedWords.normalize(str);

        return this.containsBannedRootNormalized(normalized);
    }

    public containsAnyBanned(str: string): boolean {
        const tokens = BannedWords.getTokens(str);

        const isAnyWord = tokens.some(token => this.isBannedWordNormalized(token));

        if (isAnyWord) {
            return true;
        }

        const normalized = BannedWords.normalize(str);

        return this.containsBannedRootNormalized(normalized)
            || this.containsBannedWordNormalized(normalized);
    }

    private isBannedWordNormalized(normalized: string): boolean {
        return this._words.has(normalized);
    }

    private containsBannedRootNormalized(normalized: string): boolean {
        return this._roots.some(root => normalized.includes(root));
    }

    private containsBannedWordNormalized(normalized: string): boolean {
        for (const word of this._words) {
            if (word.length >= 4 && normalized.includes(word)) {
                return true;
            }
        }

        return false;
    }
}