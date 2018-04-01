$.getJSON('./scripts/text.json', ready);

class WordScore {
  constructor() {
    this.backing_store = {
      'zh': 0,
      'pinyin': 0,
      'en': 0
    }
  }

  update(mode, score) {
    if (['zh', 'pinyin', 'en'].indexOf(mode) == -1) return;

    this.backing_store[mode] = score;
  }

  get total() {
    let ZH_WEIGHTED = 1;
    let PINYIN_WEIGHTED = 1;
    let EN_WEIGHTED = 1;
    return (this.backing_store.zh * ZH_WEIGHTED) + (this.backing_store.pinyin * PINYIN_WEIGHTED) + (this.backing_store.en * EN_WEIGHTED);
  }
}

class Word {
  constructor(entry) {
    this.zh = entry.zh;
    this.en = entry.en;
    this.pinyin = entry.pinyin;
    this.part_of_speech = entry.part_of_speech;

    this.score = new WordScore();
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

  get(key) {
    return this.backing_store[key];
  }

  get list() {
    return this.backing_store;
  }

  get keys() {
    return Object.keys(this.backing_store);
  }

  get listScore() {
    var _this = this;
    let POSSIBLE_SCORE = this.keys.length * 3;
    var cumulative_score = 0;

    $.each(this.keys, function(i, key) {
      let word = _this.backing_store[key];
      cumulative_score += word.score.total;
    });

    return cumulative_score / POSSIBLE_SCORE;
  }

  get progress() {
    let score = this.listScore;
    var percentage = score * 100;

    return ~~percentage;
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

    this.round = 1;
    this.word_index = 0;
    this.num_attempts = 0;

    this.mode = mode;
    this.current_mode = mode;

    this.words = new WordList(words);
    this.reviewed = [];

    this.mastery = new MasteryStorage();
  }

  start() {
    if (this.mastery.shouldRun) {
      this.populate();
      this.nextAnswer();
    }
    else {
      Log(this.mastery);
    }
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

  removeListeners() {
    $(document).unbind('keyup');
    $(document).unbind('keypress');
    $('.option').unbind('click');
    $('.option input[type="button"]').unbind('click');
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
      _this.text = _this.text.replace(entry.zh, `<span class='key-word' data-key='${md5(entry.zh)}'>${entry[_this.current_mode]}</span>`);
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
      this.incorrectResponse();
    }
  }

  responded(key) {
    var key = this.active_node.data('key');
    var response = $('.option input[type="text"]').val();

    var entry = this.words.get(key);
    var answer = entry[this.nextMode()];

    if (response == answer) {
      this.correctResponse();
    } else {
      this.incorrectResponse();
    }
  }

  nextAnswer() {
    this.active_node = $($('.key-word').get(this.word_index));
    this.active_node.removeClass('gray');
    this.active_node.addClass('highlighted');

    // if (this.randomType() == 'choice') {
      this.addMultipleChoice();
    // }
    // else {
    //   this.addTextBox();
    // }
  }

  incorrectResponse() {
    this.active_node.addClass('incorrect');
    this.num_attempts++;
  }

  correctResponse() {
    this.active_node.removeClass('incorrect');
    let key = this.active_node.data('key');

    if (this.num_attempts == 0) {
      var word = this.words.get(this.active_node.data('key'));
      word.score.update(this.current_mode, 1);
      $('.number .percentage').text(this.words.progress);
    }

    this.reviewed.push(key);
    $('.number .word-counter').text(this.reviewed.length);

    this.num_attempts = 0;
    this.word_index++;

    this.active_node.removeClass('highlighted');
    this.active_node.addClass('reviewed');
    this.active_node.text(this.active_node.data(this.nextMode()));

    if (this.word_index == this.words.keys.length) {
      this.reviewed = [];
      this.word_index = 0;

      if (this.round == 3) {
        this.round = 1;
        this.mastery.update(this.words.progress);
        this.current_mode = this.mode;

        $('.options').empty();
        return this.start();
      }

      this.current_mode = this.nextMode();
      $('.number .word-counter').text(0);

      this.round++;

      this.populateText();
    }

    $('.options').empty();
    this.nextAnswer();
  }

  nextMode() {
    if (this.current_mode == 'en') return 'pinyin';
    else if (this.current_mode == 'pinyin') return 'zh';
    else if (this.current_mode == 'zh') return 'en';
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

class MasteryStorage {
  constructor() {
    if (this.isNull) {
      this.backing_store = [];
    }
    else {
      this.backing_store = LS.get('mastery-data');
    }
  }

  update(progress) {
    var latest_round = 1;
    if (!this.isNull) {
      latest_round = this.backing_store[this.backing_store.length - 1].round;
    }

    var timestamp = moment();
    let interval = this.nextRoundFrom(latest_round);

    this.backing_store.push({
      'round': latest_round + 1,
      'progess': progress,
      'completed_at': timestamp,
      'next_round_available_at': timestamp.clone().add(interval, 'minutes')
    });

    this.save();
  }

  save() {
    LS.set('mastery-data', this.backing_store);
    Log(LS.get('mastery-data'));
  }

  nextRoundFrom(round) {
    // Three review rounds without a time cap.
    if (round < 3) {
      return 0;
    }

    // After x rounds, come back after:
    // First "real round."
    if (round == 3) return 5;
    if (round == 4) return 10;
    if (round == 5) return 15;
    if (round == 6) return 30;
    if (round == 7) return 60 * 2;
    if (round == 8) return 60 * 3;
    if (round == 9) return 60 * 6;
    if (round == 10) return 60 * 12;
    if (round == 11) return 60 * 24;
    if (round == 12) return 60 * 48;
  }

  get isNull() {
    return LS.get('mastery-data') === null;
  }

  get shouldRun() {
    if (this.isNull) return true;

    let last_object = this.backing_store[this.backing_store.length - 1];
    return moment() > moment(last_object.next_round_available_at);
  }
}

function ready(data) {
  var Learn = new LearnMode(data.title, data.text, data.words, 'en');
  Learn.start();
}
