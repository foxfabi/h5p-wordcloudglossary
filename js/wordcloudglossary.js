var H5P = H5P || {};
/*
 * String method to remove stop words
 * Written by GeekLad http://geeklad.com
 * Stop words obtained from http://www.lextek.com/manuals/onix/stopwords1.html
 *   Usage: string_variable.removeStopWords();
 *   Output: The original String with stop words removed
 */
String.prototype.removeStopWords = function() {
  var x;
  var y;
  var word;
  var stop_word;
  var regex_str;
  var regex;
  var cleansed_string = this.valueOf();
  // Split out all the individual words in the phrase
  words = cleansed_string.match(/[^\s]+|\s+[^\s+]$/g)
  // Review all the words
  for(x=0; x < words.length; x++) {
    // For each word, check all the stop words in all languages
    for (var lang in stop_words) {
      if (stop_words.hasOwnProperty(lang)) {
        for (var key in stop_words[lang]) {
          // Get the current word
          word = words[x];
          // Get the stop word
          stop_word = stop_words[lang][key];//stop_words[y];
          // If the word matches the stop word, remove it from the keywords
          //console.log("'" + word + "' may match '" + stop_word + "'?");
          if(word.toLowerCase() == stop_word.toLowerCase()) {
            //console.log("'" + word + "' matched '" + stop_word + "'!!");
            // Build the regex
            regex_str = "^\\s*"+stop_word+"\\s*$";      // Only word
            regex_str += "|^\\s*"+stop_word+"\\s+";     // First word
            regex_str += "|\\s+"+stop_word+"\\s*$";     // Last word
            regex_str += "|\\s+"+stop_word+"\\s+";      // Word somewhere in the middle
            regex = new RegExp(regex_str, "ig");
         
            // Remove the word from the keywords
            cleansed_string = cleansed_string.replace(regex, " ");
          }
        }
      }
    }
  }
  return cleansed_string.replace(/^\s+|\s+$/g, "");
}

/**
 * Constructor.
 */
H5P.WordCloudGlossary = (function ($, JoubelUI) {
  var GLOSSARY_CONTAINER = 'h5p-wordcloud-glossary';
  
  function WordCloudGlossary(options) {
    if (!(this instanceof H5P.WordCloudGlossary)) {
      return new H5P.WordCloudGlossary(options);
    }
    var self = this;
    // Set default behavior.
    self.options = $.extend({
      intro: "Lorem ipsum dolor sit amet",
    }, options);
    H5P.EventDispatcher.call(this);
    this.on('resize', self.resizeCanvas, self);
  }
  WordCloudGlossary.prototype = Object.create(H5P.EventDispatcher.prototype);
  WordCloudGlossary.prototype.constructor = WordCloudGlossary;

  /**
   * Append field to wrapper.
   *
   * @param {jQuery} $container
   */
  WordCloudGlossary.prototype.attach = function ($container) {
    var self = this;
    self.userGlossary = [];
    self.addGoogleFont(self.options.settings.font);
    self.canvasId = Math.round(new Date().getTime() + (Math.random() * 100));
    self.$container = $container.addClass('h5p-wordcloud');
    $introPage = $('<div id="intro-page"></div>');
    $title = $('<div/>', {
      'class': 'h5p-wordcloud-title',
      'tabindex': 0,
      'html' : self.options.intro
    }).appendTo($introPage);
    self.$container.append($introPage);
    $visualizer = $('<div/>', {
      'id': 'h5p-visualizer'
    });
    $canvasWrapper = $('<canvas>', {
      'class': 'wordcloud-canvas',
      'id': 'wordcloud-' + self.canvasId,
      'html' : 'Upgrade your browser ...'
    });
    $canvasWrapper.appendTo($visualizer);
    self.$container.append($visualizer);
    
    self.$glossary = $('<div>', {
      'id': GLOSSARY_CONTAINER
    });
    self.$container.delay( 800 ).append(self.$glossary);

    document.fonts.ready.then(function () {
      self.buildTags();
      self.generateCloud();
    });
  }
    
  WordCloudGlossary.prototype.buildTags = function() {
    var self = this;
    var wordsArray = self.splitByWords(self.options.input);
    var tags = self.createWordMap(wordsArray);
    var sortable = [];
    for (var item in tags) {
        sortable.push([item, tags[item]]);
    }
    var sorted = sortable.sort(function(a, b) {
      return b[1] - a[1];
    });
    self.tags = {};
    for (var i = 0; i < sorted.length; ++i) {
      if (i > self.options.settings.max) break;
      var key = sorted[i][0];
      var value = sorted[i][1];
      if (self.tags[key] === undefined) self.tags[key] = value;
    }
  }
  WordCloudGlossary.prototype.splitByWords = function (input) {
    var self = this;
    var stripped = input.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    if (self.options.settings.useStopWords) {
      var stripped = stripped.removeStopWords();
    }
    // split string by spaces (including spaces, tabs, and newlines)
    var wordsArray = stripped.split(/\s+/);
    return wordsArray;
  }
  
  WordCloudGlossary.prototype.createWordMap = function (wordsArray) {
    // create map for word counts
    var wordsMap = {};
    wordsArray.forEach(function (key) {
      if (wordsMap.hasOwnProperty(key)) {
        wordsMap[key]++;
      } else {
        wordsMap[key] = 1;
      }
    });
    return wordsMap;
  }

  WordCloudGlossary.prototype.addGoogleFont = function(FontName) {
    $("head").append("<link href='https://fonts.googleapis.com/css?family=" + encodeURI(FontName) + "' rel='stylesheet' type='text/css'>");
  }
  

  
  WordCloudGlossary.prototype.generateCloud = function () {
    var self = this;
    var canvasWidth = $('#h5p-visualizer').width();
    var canvasHeight = $('#h5p-visualizer').height();
    var $tags = [];
    for (var k in self.tags) {
      if (self.tags.hasOwnProperty(k)) {
        $tags.push([k, self.tags[k]]);
      }
    }
    // Extend defaults with provided options
    var gridSize = Math.round(canvasWidth / canvasHeight);
    var options = {
      list: $tags,
      fontFamily: '"' + self.options.settings.font + '"', ///'Times, serif',
      gridSize: gridSize,
      weightFactor: function (size) {
        var scaling = (Math.pow(size * gridSize, self.options.settings.weightFactor) / $tags.length);
        return scaling;
        //return size * gridSize / self.options.settings.max; // * Math.sqrt(2*size) * ;
      },
      color: function (word, weight, fontSize, distance, theta) {
        var percent = weight/self.options.settings.max;
        return self.lerpColor(self.options.settings.leftColor, self.options.settings.rightColor, theta);
      },
      click: function(item, dimension, event) {
        self.addWord(self.$glossary, item[0]);
      },
      //rotateRatio: 0.1,
      shape: self.options.settings.shape,
      //rotationSteps: 0.1,
      shuffle: true,
      //minRotation: 0.1,
      //maxRotation: 0.9,
      shuffle: true,
      //ellipticity: 0,
      drawOutOfBound: false,
  
    };
    if (WordCloudGenerator.isSupported) {
      WordCloudGenerator('wordcloud-' + self.canvasId,  options);
    }
  }
  
  /**
   * A linear interpolator for hexadecimal colors
   * @param {String} a
   * @param {String} b
   * @param {Number} amount
   * @example
   * // returns #7F7F7F
   * lerpColor('#000000', '#ffffff', 0.5)
   * @returns {String}
   */
  WordCloudGlossary.prototype.lerpColor = function (a, b, amount) { 
    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
  }
  
  /**
   * Update the dimensions of the task when resizing the task.
   */
  WordCloudGlossary.prototype.resizeCanvas = function () {
    var self = this;
    var canvasWidth = $('#h5p-visualizer').width();
    var canvasHeight = Math.round(canvasWidth / 16 * 5);
    $('#h5p-visualizer').height(canvasHeight);
    var canvas  = $('#wordcloud-' + self.canvasId);
    var context = canvas[0].getContext('2d');
    canvas.width(canvasWidth);
    canvas.height(canvasHeight);
    context.canvas.height = canvasHeight;
    context.canvas.width  = canvasWidth;
    document.fonts.ready.then(function () {
      self.generateCloud();
    });
  };
  
  /**
   * Adds a new word to the glossary
   */
  WordCloudGlossary.prototype.addWord = function ($container, word) {
    var self = this;
    var wordText = word;
    if (!self.userGlossary.includes(wordText)) {
      var wordDescription = self.options.UI.defineWordPlaceholder;
      var newWord = new H5P.WordCloudGlossary.WordInstance(wordText, wordDescription);
      self.userGlossary.push(wordText);
      // Create word element and prepend it to view
      var $newWord = self.createWordElementFromWordInstance(newWord);
      $newWord.prependTo($container);
      return $newWord;
    }
  };
  /**
   * Creates word element from word instance
   * @param {H5P.WordCloudGlossary.WordInstance} newWord Word instance object to create element from
   * @return {jQuery} $newTag Tag element
   */
  WordCloudGlossary.prototype.createWordElementFromWordInstance = function (newWord) {
    var self = this;
    var $newWord = self.createNewWord(newWord);
    var $focusOn = $newWord.find('textarea').eq(0);
    setTimeout(function () {
      $focusOn.focus();
    }, 0);
    return $newWord;
  };
  /**
   * Create a new word container
   * @param {H5P.WordCloudGlossary.WordInstance} wordInstance Word instance object to create the word from
   * @returns {jQuery} $wordContainer New word element
   */
  WordCloudGlossary.prototype.createNewWord = function (wordInstance) {
    var self = this;

    // Word container
    var $wordContainer = $('<div/>', {
      'class': 'created-word-container'
    }).data('uniqueId', wordInstance.getUniqueId());
    $wordContainer.attr('id', 'word-' + wordInstance.getUniqueId());
    var initialText = wordInstance.wordText();

    // Input paragraph area
    var $glossaryWord = $('<div>', {
      'class': 'created-word',
      'spellcheck': 'false',
      'contenteditable': false,
      'text': initialText
    }).appendTo($wordContainer);
    var $glossaryDescription = $('<textarea/>', {
      'class' : 'glossary-description',
      'name' : "description-" + wordInstance.getUniqueId(),
      'rows': 1,
      'id': wordInstance.getUniqueId()
    }).appendTo($wordContainer);
    $glossaryDescription.focus(function(){
      $(this).attr('rows',5);
    }).blur(function(){
      $(this).attr('rows',1);
    });
//    self.addCustomHoverEffects($wordContainer);

    return $wordContainer;
  };
  /**
   * Update the dimensions of the glossary when add a new word
   */
  WordCloudGlossary.prototype.resizdadaseGlossary = function () {
    var self = this;
    var glossaryHeight = $('#intro-page').height() + $('#h5p-visualizer').height() + self.$glossary.height();
    console.log(glossaryHeight + " ... " + self.contentId);
    //*h5p-iframe-63*//
    $('.h5p-iframe-wrapper').height(glossaryHeight);
  };
  
  return WordCloudGlossary;
})(H5P.jQuery, H5P.JoubelUI);