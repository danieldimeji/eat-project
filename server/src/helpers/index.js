module.exports = {
  toTitleCase: (str) => str.toLowerCase().split(" ").map((word) => word.replace(word[0], word[0].toUpperCase())).join(" "),
};
