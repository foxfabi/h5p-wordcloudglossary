var H5P = H5P || {};
H5P.WordCloudGlossary = H5P.WordCloudGlossary || {};

/**
 * Tag Instance module
 */
H5P.WordCloudGlossary.WordInstance = (function () {

  /**
   * Initialize module.
   * @param {String} defineWordPlaceholder Placeholder for Word Instance
   * @param {String} wordDescription String describing the word
   * @returns {Object} WordInstance WordInstance instance
   */
  function WordInstance(wordText, wordDescription) {
    this.uniqueId = this.guid();//uniqueId;
    this.text = wordText;
    this.wordDescription = wordDescription;
  }

  WordInstance.prototype.guid = function () {
    var min = 111111111;
    var max = 999999999;
    var num = Math.floor(Math.random() * (max - min)) + min;
    return num.toString();
  }
  
  /**
   * Get tag type description
   * @returns {String} String representation of the tag type
   */
  WordInstance.prototype.getWordDescription = function () {
    return this.wordDescription;
  };

  /**
   * Get tag id
   * @returns {Number} uniqueId A unique identifier for the tag
   */
  WordInstance.prototype.getUniqueId = function () {
    return this.uniqueId;
  };

  /**
   * Get or set word text depending on provided parameter
   * @param {String} text If defined this will be the new tag text for the tag
   * @returns {*} Returns text with no parameters, and return this when setting parameter for chaining
   */
  WordInstance.prototype.wordText = function (text) {
    // Get text value if no arguments
    if (text === undefined) {
      return this.text;
    }
    // Set text value
    this.text = text;
    return this;
  };

  return WordInstance;
}());
