export declare class TrieService {
    private root;
    insert(word: string, data: any): void;
    search(word: string): any | null;
    getWordsWithPrefix(prefix: string, limit?: number): any[];
    private collectWords;
    buildFromItems(items: Array<{
        searchText: string;
        data: any;
    }>): void;
    fuzzySearch(query: string, maxDistance?: number): any[];
    private fuzzySearchHelper;
    private calculateEditDistance;
}
