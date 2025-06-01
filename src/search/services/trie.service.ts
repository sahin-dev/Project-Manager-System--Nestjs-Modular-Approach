import { Injectable } from "@nestjs/common"

class TrieNode {
  children: Map<string, TrieNode> = new Map()
  isEndOfWord = false
  data: any = null
}

@Injectable()
export class TrieService {
  private root: TrieNode = new TrieNode()

  /**
   * Insert a word into the Trie with associated data
   */
  insert(word: string, data: any): void {
    let current = this.root

    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode())
      }
      current = current.children.get(char)!
    }

    current.isEndOfWord = true
    current.data = data
  }

  /**
   * Search for exact word match
   */
  search(word: string): any | null {
    let current = this.root

    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        return null
      }
      current = current.children.get(char)!
    }

    return current.isEndOfWord ? current.data : null
  }

  /**
   * Get all words with given prefix (autocomplete)
   */
  getWordsWithPrefix(prefix: string, limit = 10): any[] {
    let current = this.root

    // Navigate to the prefix
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) {
        return []
      }
      current = current.children.get(char)!
    }

    // Collect all words with this prefix
    const results: any[] = []
    this.collectWords(current, prefix, results, limit)

    return results
  }

  /**
   * Recursively collect words from a node
   */
  private collectWords(node: TrieNode, currentWord: string, results: any[], limit: number): void {
    if (results.length >= limit) return

    if (node.isEndOfWord && node.data) {
      results.push({
        word: currentWord,
        data: node.data,
      })
    }

    for (const [char, childNode] of node.children) {
      this.collectWords(childNode, currentWord + char, results, limit)
    }
  }

  /**
   * Build Trie from array of items
   */
  buildFromItems(items: Array<{ searchText: string; data: any }>): void {
    this.root = new TrieNode() // Reset

    for (const item of items) {
      this.insert(item.searchText, item.data)
    }
  }

  /**
   * Fuzzy search with edit distance tolerance
   */
  fuzzySearch(query: string, maxDistance = 2): any[] {
    const results: Array<{ word: string; data: any; distance: number }> = []
    this.fuzzySearchHelper(this.root, "", query, 0, maxDistance, results)

    // Sort by edit distance
    results.sort((a, b) => a.distance - b.distance)

    return results.slice(0, 10) // Return top 10 matches
  }

  private fuzzySearchHelper(
    node: TrieNode,
    currentWord: string,
    target: string,
    currentDistance: number,
    maxDistance: number,
    results: Array<{ word: string; data: any; distance: number }>,
  ): void {
    if (currentDistance > maxDistance) return

    if (node.isEndOfWord && node.data) {
      const finalDistance = this.calculateEditDistance(currentWord, target)
      if (finalDistance <= maxDistance) {
        results.push({
          word: currentWord,
          data: node.data,
          distance: finalDistance,
        })
      }
    }

    for (const [char, childNode] of node.children) {
      // Continue building the word
      this.fuzzySearchHelper(childNode, currentWord + char, target, currentDistance, maxDistance, results)
    }
  }

  private calculateEditDistance(str1: string, str2: string): number {
    const dp: number[][] = Array(str1.length + 1)
      .fill(null)
      .map(() => Array(str2.length + 1).fill(0))

    for (let i = 0; i <= str1.length; i++) dp[i][0] = i
    for (let j = 0; j <= str2.length; j++) dp[0][j] = j

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1]
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1, // deletion
            dp[i][j - 1] + 1, // insertion
            dp[i - 1][j - 1] + 1, // substitution
          )
        }
      }
    }

    return dp[str1.length][str2.length]
  }
}
