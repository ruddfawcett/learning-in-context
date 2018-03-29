$.getJSON('./scripts/text.json', ready);

class Word {
    constructor(entry) {
      this.zh = entry.zh;
      this.en = entry.en;
      this.pinyin = entry.pinyin;
      this.part_of_speech = entry.part_of_speech;
    }
}

class WordList {
  constructor(words) {
    this.backing_store = {};
    let keys = Object.keys(words);

    var _this = this;
    $.each(keys, function(i, key) {
      var entry = words[key];
      _this.backing_store[md5(entry.zh)] = new Word(words[key]);
    });
  }

  get list() {
    return this.backing_store;
  }

  get keys() {
    return Object.keys(this.backing_store);
  }
}

class LearnMode {
  constructor(title, text, words, mode) {
    this.title = title;
    this.text = text;

    this.round = 0;
    this.word_index = 0;
    this.num_attempts = 0;

    this.mode = mode;
    this.words = new WordList(words);
    this.reviewed = [];
  }

  start() {
    this.populate();
    this.setupAnswers();
  }

  addListeners() {
    var _this =  this;

    $('.option').on('click', function() {
      _this.selected($(this));
    });

    $(document).unbind('keyup').bind('keyup', function(e) {
      let idx = parseInt(e.key) - 1;
      if (!isNaN(idx) && idx < 4) {
        var node = $($('.option').get(idx));
        return _this.selected(node);
      }
    });
  }

  populate() {
    $('.title h1').text(this.title);
    $('.number .round-total').text(Object.keys(this.words.list).length);

    this.populateText();
  }

  populateText() {
    var _this = this;

    $.each(this.words.keys, function(i, key) {
      var entry = _this.words.list[key];
      _this.text = _this.text.replace(entry.zh, `<span class='key-word' data-key='${md5(entry.zh)}'>${entry[_this.mode]}</span>`);
    });

    $('.body p').html(this.text);
  }

  setupAnswers() {
    var _this = this;

    var active_node = $($('.key-word').get(this.word_index));
    active_node.removeClass('gray');
    active_node.addClass('highlighted');

    var keys = this.words.keys;
    var stripped_word = keys.splice(keys.indexOf(active_node.data('key')), 1)[0];

    var shuffled = this.shuffle(keys);
    var selected = shuffled.slice(0, 3);

    selected.push(active_node.data('key'));
    selected = this.shuffle(selected);

    $.each(selected, function(i, key) {
      $('.options').append(_this.buildOption(i + 1, key));
    });

    this.addListeners();
  }

  buildOption(idx, key) {
    var entry = this.words.list[key];
    return `<div class='option' data-key='${key}'>
              <p>${entry[this.nextMode]} <span class='key'>${idx}</span></p>
            </div>`;
  }

  selected(option) {
    var active_node = $($('.key-word').get(this.word_index));

    if (option.data('key') == active_node.data('key')) {
      active_node.removeClass('incorrect');
      this.reviewed.push(option.data('key'));
      $('.number .round-counter').text(this.reviewed.length);

      this.word_index++;

      active_node.removeClass('highlighted');
      active_node.addClass('reviewed');
      active_node.text(active_node.data(this.nextMode));

      if (this.word_index + 1 == this.words.keys) {
        mode = this.nextMode;

        this.word_index = 0;

        if (this.nextMode != 'en') {
          this.populateText();
        }
      }

      $('.options').empty();
      this.setupAnswers();
    } else {
      active_node.addClass('incorrect').effect('shake', {
        times: 2,
        distance: 5
      });
    }
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }

  get nextMode() {
    if (this.mode == 'en') return 'pinyin';
    else if (this.mode == 'pinyin') return 'zh';
    else return false;
  }

  get representation() {
    return '';
  }
}

function ready(data) {
  var Learn = new LearnMode(data.title, data.text, data.words, 'en');
  Learn.start();
}
