// trie.js
class TrieNode {
  constructor() {
      this.children = {};
      this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
      this.root = new TrieNode();
  }

  // Insert a word into the Trie
  insert(word) {
      let node = this.root;
      for (let char of word) {
          if (!node.children[char]) {
              node.children[char] = new TrieNode();
          }
          node = node.children[char];
      }
      node.isEndOfWord = true; // Mark the end of the word
  }

  // Autocomplete function to suggest words based on the prefix
  autocomplete(prefix) {
      let node = this.root;
      for (let char of prefix) {
          if (!node.children[char]) return []; // No suggestions found
          node = node.children[char];
      }
      return this._findAllWords(node, prefix); // Find all words from this node
  }

  // Helper function to find all words from a given node
  _findAllWords(node, prefix) {
      let words = [];
      if (node.isEndOfWord) words.push(prefix); // Add the word if it's an end of a valid word
      for (let char in node.children) {
          words = words.concat(this._findAllWords(node.children[char], prefix + char)); // Recursively find words
      }
      return words;
  }

  // Delete a word from the Trie
  delete(word) {
      const deleteHelper = (node, word, index) => {
          if (!node) return false; // Base case: node doesn't exist

          // If we reached the end of the word
          if (index === word.length) {
              if (!node.isEndOfWord) return false; // Word does not exist
              node.isEndOfWord = false; // Unmark the end of the word
              // Check if the node has no children
              return Object.keys(node.children).length === 0; // Indicates whether to delete the node
          }

          const char = word[index];
          const shouldDeleteCurrentNode = deleteHelper(node.children[char], word, index + 1);

          // If true, delete the child reference
          if (shouldDeleteCurrentNode) {
              delete node.children[char];
              return Object.keys(node.children).length === 0 && !node.isEndOfWord; // Check if the parent should delete itself
          }
          return false; // Do not delete the current node
      };

      deleteHelper(this.root, word, 0); // Start deletion from the root
  }
}

module.exports = Trie;
