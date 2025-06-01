"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrieService = void 0;
const common_1 = require("@nestjs/common");
class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.data = null;
    }
}
let TrieService = class TrieService {
    constructor() {
        this.root = new TrieNode();
    }
    insert(word, data) {
        let current = this.root;
        for (const char of word.toLowerCase()) {
            if (!current.children.has(char)) {
                current.children.set(char, new TrieNode());
            }
            current = current.children.get(char);
        }
        current.isEndOfWord = true;
        current.data = data;
    }
    search(word) {
        let current = this.root;
        for (const char of word.toLowerCase()) {
            if (!current.children.has(char)) {
                return null;
            }
            current = current.children.get(char);
        }
        return current.isEndOfWord ? current.data : null;
    }
    getWordsWithPrefix(prefix, limit = 10) {
        let current = this.root;
        for (const char of prefix.toLowerCase()) {
            if (!current.children.has(char)) {
                return [];
            }
            current = current.children.get(char);
        }
        const results = [];
        this.collectWords(current, prefix, results, limit);
        return results;
    }
    collectWords(node, currentWord, results, limit) {
        if (results.length >= limit)
            return;
        if (node.isEndOfWord && node.data) {
            results.push({
                word: currentWord,
                data: node.data,
            });
        }
        for (const [char, childNode] of node.children) {
            this.collectWords(childNode, currentWord + char, results, limit);
        }
    }
    buildFromItems(items) {
        this.root = new TrieNode();
        for (const item of items) {
            this.insert(item.searchText, item.data);
        }
    }
    fuzzySearch(query, maxDistance = 2) {
        const results = [];
        this.fuzzySearchHelper(this.root, "", query, 0, maxDistance, results);
        results.sort((a, b) => a.distance - b.distance);
        return results.slice(0, 10);
    }
    fuzzySearchHelper(node, currentWord, target, currentDistance, maxDistance, results) {
        if (currentDistance > maxDistance)
            return;
        if (node.isEndOfWord && node.data) {
            const finalDistance = this.calculateEditDistance(currentWord, target);
            if (finalDistance <= maxDistance) {
                results.push({
                    word: currentWord,
                    data: node.data,
                    distance: finalDistance,
                });
            }
        }
        for (const [char, childNode] of node.children) {
            this.fuzzySearchHelper(childNode, currentWord + char, target, currentDistance, maxDistance, results);
        }
    }
    calculateEditDistance(str1, str2) {
        const dp = Array(str1.length + 1)
            .fill(null)
            .map(() => Array(str2.length + 1).fill(0));
        for (let i = 0; i <= str1.length; i++)
            dp[i][0] = i;
        for (let j = 0; j <= str2.length; j++)
            dp[0][j] = j;
        for (let i = 1; i <= str1.length; i++) {
            for (let j = 1; j <= str2.length; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                }
                else {
                    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
                }
            }
        }
        return dp[str1.length][str2.length];
    }
};
exports.TrieService = TrieService;
exports.TrieService = TrieService = __decorate([
    (0, common_1.Injectable)()
], TrieService);
//# sourceMappingURL=trie.service.js.map