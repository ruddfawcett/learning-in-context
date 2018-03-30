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

  byKey(key) {
    return this.backing_store[key];
  }
}

class LearnMode {
  constructor(title, text, words, mode) {
    this.title = title;
    this.backing_text = text;
    this.text = text;
    this.types = [
      'choice',
      'type'
    ];

    this.active_node = null;

    this.type = this.randomType();

    this.round = 0;
    this.word_index = 0;
    this.num_attempts = 0;

    this.mode = mode;
    this.words = new WordList(words);
    this.reviewed = [];
  }

  start() {
    this.populate();
    this.nextAnswer();
  }

  addChoiceListeners() {
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

  addTextListeners() {
    var _this =  this;

    $('.option input[type="button"]').on('click', function() {
      _this.responded();
    });

    $(document).bind('keypress', function(e) {
      if (e.which == 13) {
        _this.responded();
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
    this.text = this.backing_text;

    $.each(this.words.keys, function(i, key) {
      var entry = _this.words.list[key];
      _this.text = _this.text.replace(entry.zh, `<span class='key-word' data-key='${md5(entry.zh)}'>${entry[_this.mode]}</span>`);
    });

    $('.body p').html(this.text);
  }

  addMultipleChoice() {
    var _this = this;

    var keys = this.words.keys;
    var stripped_word = keys.splice(keys.indexOf(this.active_node.data('key')), 1)[0];

    var shuffled = this.shuffle(keys);
    var selected = shuffled.slice(0, 3);

    selected.push(this.active_node.data('key'));
    selected = this.shuffle(selected);

    $.each(selected, function(i, key) {
      $('.options').append(_this.buildChoice(i + 1, key));
    });

    this.addChoiceListeners();
  }

  addTextBox(key) {
    var _this = this;

    $('.options').append(`
      <div class='option input'>
        <input type='text' placeholder='' data-key='${key}' />
      </div>
      <div class='option submit'>
        <input type='button' value='Answer' />
      </div>`);

    $('.option input[type="text"]').focus();

    this.addTextListeners();
  }

  buildChoice(idx, key) {
    var entry = this.words.list[key];
    return `<div class='option multiple-choice' data-key='${key}'>
              <p>${entry[this.nextMode()]} <span class='key'>${idx}</span></p>
            </div>`;
  }

  selected(option) {
    if (option.data('key') == this.active_node.data('key')) {
      this.correctResponse();
    } else {
      this.active_node.addClass('incorrect').effect('shake', {
        times: 2,
        distance: 5
      });
    }
  }

  responded(key) {
    var key = this.active_node.data('key');
    var response = $('.option input[type="text"]').val();

    var entry = this.words.byKey(key);
    var answer = entry[this.nextMode()];

    if (response == answer) {
      this.correctResponse();
    } else {
      this.active_node.addClass('incorrect')
    }
  }

  nextAnswer() {
    this.active_node = $($('.key-word').get(this.word_index));
    this.active_node.removeClass('gray');
    this.active_node.addClass('highlighted');

    if (this.randomType() == 'choice') {
      this.addMultipleChoice();
    }
    else {
      this.addTextBox();
    }
  }

  correctResponse() {
    this.active_node.removeClass('incorrect');
    this.reviewed.push(this.active_node.data('key'));
    $('.number .round-counter').text(this.reviewed.length);

    this.word_index++;

    this.active_node.removeClass('highlighted');
    this.active_node.addClass('reviewed');
    this.active_node.text(this.active_node.data(this.nextMode()));

    if (this.word_index == this.words.keys.length) {
      if (this.nextMode()) {
        this.mode = this.nextMode();
        this.word_index = 0;

        this.populateText();
      } else {
        alert("You have finished the scaffolding! I'm still working to add more content!");
      }
    }

    $('.options').empty();
    this.nextAnswer();
  }

  nextMode() {
    if (this.mode == 'en') return 'pinyin';
    else if (this.mode == 'pinyin') return 'zh';
    else if (this.mode == 'zh') return 'en';
    else return false;
  }

    shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }

      return a;
    }

  randomType() {
    let idx = Math.floor(Math.random() * Math.floor(2));
    return this.types[idx];
  }
}

function ready(data) {
  var Learn = new LearnMode(data.title, data.text, data.words, 'en');
  Learn.start();
}
