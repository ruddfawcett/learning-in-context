$.getJSON('./scripts/text.json', ready);

function ready(data) {
  var title, text;

  var round = 0;
  var current_idx = 0;
  var num_attempts = 0;

  var mode = 'en';

  var words = {};
  var learned = [];

  populate(data);
  setup(data);

  function populate() {
    title = data.title;
    text = data.text;
    words = data.words;

    $.each(Object.keys(data.words), function(i, key) {
      var entry = data.words[key];
      text = text.replace(entry.zh, `<span class='key-word gray' data-zh='${entry.zh}' data-en='${entry.en}' data-pinyin='${entry.pinyin}'>${entry[mode]}</span>`);
    });

    $('.title h1').text(title);
    $('.body p').html(text);
  }

  function setup() {
    var current_word_node = $($('.key-word').get(current_idx));
    current_word_node.removeClass('gray');
    current_word_node.addClass('highlighted');

    var keys = Object.keys(words);
    var stripped_word = keys.splice(keys.indexOf(current_word_node.data('en')), 1)[0];

    var shuffled = shuffle(keys);
    var selected = shuffled.slice(0, 3);

    var word_list = [];
    word_list.push(words[current_word_node.data('en')]);
    $.each(selected, function(i, word) {
      word_list.push(words[word]);
    });

    word_list = shuffle(word_list);

    var options = [];
    $.each(word_list, function(i, word) {
      var option = build_option(i+1, word);
      options.push(option);
      $('.options').append(option);
    });

    $('.option').on('click', function() {
      option_selected($(this));
    });

    $(document).unbind('keyup').bind('keyup', function(e) {
      let idx = parseInt(e.key) - 1;
      if (!isNaN(idx) && idx < 4) {
        var node = $($('.option').get(idx));
        return option_selected(node);
      }
    });

    function option_selected(node) {
      if (node.data(mode) == current_word_node.data(mode)) {
        current_word_node.removeClass('incorrect');
        if (num_attempts == 0) {
          if (learned.indexOf(node.data(mode)) == -1) {
            learned.push(node.data(mode));
            var decimal = learned.length / Object.keys(words).length;
            var percentage = decimal * 100;
            $('.number .percentage').text(~~percentage);
          }
        }
        else {
          num_attempts = 0;
        }

        current_idx++;
        current_word_node.removeClass('highlighted');
        current_word_node.addClass('normal');
        current_word_node.text(current_word_node.data(next_mode(mode)));

        if (current_idx + 1 == Object.keys(words).length) {
          round++;
          if (round == 3) {
            round = 0;
            $('.number .percentage').text(0);
            learned = [];
            mode = next_mode(mode);
          }

          $('.number .round').text(round);
          current_idx = 0;

          if (next_mode(mode) != 'en') {
            populate();
          }
        }

        $('.options').empty();
        setup();
      }
      else {
        num_attempts++;
        current_word_node.addClass('incorrect');
      }
    }
  }

  function next_mode(mode) {
    if (mode == 'en') return 'pinyin';
    else if (mode == 'pinyin') return 'zh';
    else return 'en';
  }

  function build_option(idx, entry) {
    return `<div class='option' data-zh='${entry.zh}' data-en='${entry.en}' data-pinyin='${entry.pinyin}'>
              <p>${entry[next_mode(mode)]} <span class='key'>${idx}</span></p>
            </div>`;
  }
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}
