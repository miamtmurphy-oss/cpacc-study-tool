(function () {
  'use strict';

  var STORAGE_KEY = 'cpacc-study-tool-attempts-v1';
  var domains = window.CPACC_DOMAINS;
  var questions = window.CPACC_QUESTIONS;
  var cards = window.CPACC_FLASHCARDS;
  var state = { index: 0, answers: [], flags: [], optionOrders: [], completed: false };
  var cardState = { deck: cards.slice(), index: 0, flipped: false, domain: 'all' };
  var sessionAttempts = [];
  var storage = { available: false, corrupt: false, message: '' };
  var views = ['home', 'exam', 'results', 'flashcards'];
  var el = function (id) { return document.getElementById(id); };

  function checkStorage() {
    try {
      var key = '__cpacc_storage_check__';
      window.localStorage.setItem(key, 'ok');
      window.localStorage.removeItem(key);
      storage.available = true;
      storage.message = 'Completed attempts are saved only in this browser.';
    } catch (error) {
      storage.available = false;
      storage.message = 'Browser storage is unavailable. You can take and review an exam in this tab, but this attempt cannot be saved for later.';
    }
    el('exam-storage-note').textContent = storage.message;
  }

  function readAttempts() {
    if (!storage.available) return [];
    try {
      var data = window.localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      var attempts = JSON.parse(data);
      if (!Array.isArray(attempts) || attempts.some(function (attempt) {
        return !attempt || !Array.isArray(attempt.answers) || attempt.answers.length !== questions.length ||
          typeof attempt.date !== 'string' || attempt.answers.some(function (answer) {
            return answer !== null && (!Number.isInteger(answer) || answer < 0 || answer > 3);
          }) || (attempt.optionOrders && (!Array.isArray(attempt.optionOrders) ||
            attempt.optionOrders.length !== questions.length || attempt.optionOrders.some(function (order) {
              return !Array.isArray(order) || order.length !== 4 ||
                order.some(function (choice) { return !Number.isInteger(choice) || choice < 0 || choice > 3; }) ||
                new Set(order).size !== 4;
            })));
      })) throw new Error('Invalid saved results');
      return attempts;
    } catch (error) {
      storage.corrupt = true;
      storage.message = 'Saved results could not be read because browser data is invalid or unavailable. The unread data will be left unchanged.';
      return [];
    }
  }

  function saveAttempt(attempt) {
    if (!storage.available) return false;
    var attempts = readAttempts();
    if (storage.corrupt) {
      storage.message = 'This attempt is available to review now, but unread browser data was left unchanged and the attempt could not be saved.';
      return false;
    }
    attempts.push(attempt);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
      return true;
    } catch (error) {
      storage.available = false;
      storage.message = 'This attempt is available to review now, but the browser could not save it for later.';
      return false;
    }
  }

  function announce(message) {
    el('live-status').textContent = '';
    window.setTimeout(function () { el('live-status').textContent = message; }, 20);
  }

  function showView(name) {
    views.forEach(function (view) { el(view + '-view').hidden = view !== name; });
    if (name === 'exam') {
      if (!state.completed) renderQuestion();
      el('exam-title').focus();
    } else if (name === 'flashcards') {
      renderCard();
      el('flashcards-title').focus();
    } else if (name === 'results') {
      el('results-title').focus();
    } else if (name === 'home') {
      el('home-title').focus();
    }
    if (window.history && window.history.replaceState) window.history.replaceState(null, '', '#' + name);
  }

  function setChoiceView(event) {
    var target = event.target.closest('[data-view]');
    if (target) showView(target.getAttribute('data-view'));
  }

  function renderQuestion() {
    var question = questions[state.index];
    var order = state.optionOrders[state.index];
    el('question-progress').textContent = 'Question ' + (state.index + 1) + ' of ' + questions.length;
    el('question-progress-bar').value = state.index + 1;
    el('question-domain').textContent = question.domain;
    el('question-text').textContent = question.prompt;
    var options = el('answer-options');
    options.replaceChildren();
    order.forEach(function (choiceIndex) {
      var label = document.createElement('label');
      label.className = 'answer-option';
      var radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'answer';
      radio.value = choiceIndex;
      radio.checked = state.answers[state.index] === choiceIndex;
      radio.addEventListener('change', function () {
        state.answers[state.index] = choiceIndex;
        renderQuestionNav();
        updateAnsweredCount();
      });
      var text = document.createElement('span');
      text.textContent = question.options[choiceIndex];
      label.append(radio, text);
      options.appendChild(label);
    });
    el('flag-question').setAttribute('aria-pressed', String(state.flags[state.index]));
    el('flag-question').textContent = state.flags[state.index] ? 'Remove review flag' : 'Flag for review';
    el('previous-question').disabled = state.index === 0;
    el('next-question').disabled = state.index === questions.length - 1;
    renderQuestionNav();
    updateAnsweredCount();
  }

  function renderQuestionNav() {
    var list = el('question-jump-list');
    list.replaceChildren();
    questions.forEach(function (_, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'jump-button';
      button.textContent = String(index + 1);
      var label = 'Question ' + (index + 1);
      if (state.answers[index] !== null) label += ', answered';
      if (state.flags[index]) label += ', flagged for review';
      button.setAttribute('aria-label', label);
      if (index === state.index) button.setAttribute('aria-current', 'true');
      button.addEventListener('click', function () {
        state.index = index;
        renderQuestion();
        el('question-text').focus();
      });
      list.appendChild(button);
    });
  }

  function updateAnsweredCount() {
    var count = state.answers.filter(function (answer) { return answer !== null; }).length;
    el('answered-count').textContent = count + ' of ' + questions.length + ' questions answered.';
  }

  function startExam() {
    state = {
      index: 0,
      answers: questions.map(function () { return null; }),
      flags: questions.map(function () { return false; }),
      optionOrders: createOptionOrders(),
      completed: false
    };
    el('exam-active').hidden = false;
    el('exam-storage-note').textContent = storage.message;
    showView('exam');
    announce('New practice exam started. Question 1 of ' + questions.length + '. Answers are not shown until you submit.');
  }

  function scoreAttempt(answers) {
    var correct = 0;
    var byDomain = {};
    domains.forEach(function (domain) { byDomain[domain] = { correct: 0, total: 0 }; });
    questions.forEach(function (question, index) {
      byDomain[question.domain].total += 1;
      if (answers[index] === question.answer) {
        correct += 1;
        byDomain[question.domain].correct += 1;
      }
    });
    return { correct: correct, percentage: Math.round(correct / questions.length * 100), byDomain: byDomain };
  }

  function submitExam() {
    if (state.completed) return;
    if (!window.confirm('Submit this exam and see the correct answers and explanations?')) return;
    var attempt = {
      date: new Date().toISOString(),
      answers: state.answers.slice(),
      optionOrders: state.optionOrders.map(function (order) { return order.slice(); })
    };
    var score = scoreAttempt(attempt.answers);
    attempt.correct = score.correct;
    attempt.percentage = score.percentage;
    var saved = saveAttempt(attempt);
    sessionAttempts.push(attempt);
    state.completed = true;
    el('exam-active').hidden = true;
    el('results-storage-note').textContent = saved
      ? 'This completed attempt was saved in this browser only. No results were sent to a server.'
      : (storage.message || 'This completed attempt is available in this tab only and was not saved.');
    renderResults(attempt, saved);
    showView('results');
    announce('Exam submitted. Score: ' + score.correct + ' out of ' + questions.length + ', ' + score.percentage + ' percent.');
  }

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function renderResults(attempt, saved) {
    var score = scoreAttempt(attempt.answers);
    var root = el('results-content');
    root.replaceChildren();
    var summary = document.createElement('section');
    summary.className = 'result-summary';
    summary.setAttribute('aria-labelledby', 'score-heading');
    summary.innerHTML = '<h2 id="score-heading">Score</h2><p class="score">' + score.correct + ' out of ' + questions.length + ' · ' + score.percentage + '%</p><p>Correct answers are explained below. Your selected response and the correct response are labeled in text.</p>';
    root.appendChild(summary);
    var breakdown = document.createElement('section');
    breakdown.className = 'domain-results';
    breakdown.setAttribute('aria-labelledby', 'breakdown-title');
    var rows = domains.map(function (domain) {
      var values = score.byDomain[domain];
      return '<tr><th scope="row">' + escapeText(domain) + '</th><td>' + values.correct + ' of ' + values.total + '</td></tr>';
    }).join('');
    breakdown.innerHTML = '<h2 id="breakdown-title">Score by CPACC knowledge domain</h2><table><thead><tr><th scope="col">Domain</th><th scope="col">Correct</th></tr></thead><tbody>' + rows + '</tbody></table>';
    root.appendChild(breakdown);
    var controls = document.createElement('div');
    controls.className = 'result-tools';
    controls.innerHTML = '<label><input type="checkbox" id="incorrect-only"> Show incorrect answers only</label>';
    root.appendChild(controls);
    var list = document.createElement('div');
    list.id = 'review-list';
    root.appendChild(list);
    var toggle = controls.querySelector('input');
    function renderReview() {
      list.replaceChildren();
      questions.forEach(function (question, index) {
        var correct = attempt.answers[index] === question.answer;
        if (toggle.checked && correct) return;
        var article = document.createElement('article');
        article.className = 'review-question';
        var heading = document.createElement('h3');
        heading.textContent = 'Question ' + (index + 1) + ': ' + question.prompt;
        var domain = document.createElement('p');
        domain.className = 'eyebrow';
        domain.textContent = question.domain;
        var status = document.createElement('p');
        status.className = 'status-text';
        status.textContent = correct ? 'Correct' : 'Incorrect';
        var selected = document.createElement('p');
        selected.textContent = attempt.answers[index] === null
          ? 'Your answer: No answer selected'
          : 'Your answer: ' + question.options[attempt.answers[index]];
        var options = document.createElement('ul');
        var order = attempt.optionOrders && attempt.optionOrders[index] || [0, 1, 2, 3];
        order.forEach(function (optionIndex) {
          var option = question.options[optionIndex];
          var item = document.createElement('li');
          item.textContent = option;
          if (optionIndex === question.answer) {
            item.className = 'answer-correct';
            item.textContent += ' — Correct answer';
          }
          if (optionIndex === attempt.answers[index]) {
            item.textContent += optionIndex === question.answer ? ' — Your answer' : ' — Your answer (incorrect)';
            if (optionIndex !== question.answer) item.classList.add('answer-selected-incorrect');
          }
          options.appendChild(item);
        });
        var explanation = document.createElement('p');
        explanation.innerHTML = '<strong>Explanation:</strong> ' + escapeText(question.explanation);
        article.append(domain, heading, status, selected, options, explanation);
        list.appendChild(article);
      });
      if (toggle.checked && !attempt.answers.some(function (answer, index) { return answer !== questions[index].answer; })) {
        list.textContent = 'There are no incorrect answers in this attempt.';
      }
      announce(toggle.checked ? 'Showing incorrect answers only.' : 'Showing all ' + questions.length + ' questions.');
    }
    toggle.addEventListener('change', renderReview);
    renderReview();
    var buttons = document.createElement('div');
    buttons.className = 'exam-controls';
    buttons.innerHTML = '<button type="button" class="secondary" id="start-another">Start a new exam</button><button type="button" class="secondary" id="view-latest">View Previous Results</button>';
    root.appendChild(buttons);
    el('start-another').addEventListener('click', startExam);
    el('view-latest').disabled = !saved && readAttempts().length === 0 && sessionAttempts.length === 0;
    el('view-latest').addEventListener('click', showLatest);
  }

  function showLatest() {
    var attempts = readAttempts();
    if (!attempts.length) {
      if (sessionAttempts.length) {
        el('results-storage-note').textContent = 'No readable saved results were found. Showing the latest completed attempt held in this tab; it may not be saved.';
        renderResults(sessionAttempts[sessionAttempts.length - 1], false);
      } else {
        el('results-storage-note').textContent = storage.corrupt || !storage.available
          ? storage.message
          : 'No saved completed attempts were found in this browser.';
        var empty = document.createElement('p');
        empty.textContent = 'There are no completed attempts available to review.';
        el('results-content').replaceChildren(empty);
      }
      showView('results');
      return;
    }
    var attempt = attempts[attempts.length - 1];
    el('results-storage-note').textContent = 'Reviewing the latest completed attempt saved in this browser. No results were sent to a server.';
    renderResults(attempt, true);
    showView('results');
  }

  function initFlashcards() {
    var select = el('domain-filter');
    select.replaceChildren();
    [['all', 'All domains']].concat(domains.map(function (domain) { return [domain, domain]; })).forEach(function (item) {
      var option = document.createElement('option');
      option.value = item[0];
      option.textContent = item[1];
      select.appendChild(option);
    });
  }

  function createOptionOrders() {
    return questions.map(function (question) {
      var order = question.options.map(function (_, index) { return index; });
      for (var i = order.length - 1; i > 0; i -= 1) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = order[i];
        order[i] = order[j];
        order[j] = temp;
      }
      return order;
    });
  }

  function renderCard() {
    var card = cardState.deck[cardState.index];
    if (!card) return;
    el('card-domain').textContent = card.domain;
    el('card-side-label').textContent = cardState.flipped ? 'Definition' : 'Term';
    el('card-content').textContent = cardState.flipped ? card.definition : card.term;
    el('card-progress').textContent = 'Card ' + (cardState.index + 1) + ' of ' + cardState.deck.length;
    el('flip-card').setAttribute('aria-pressed', String(cardState.flipped));
    el('flip-card').textContent = cardState.flipped ? 'Show Term' : 'Flip Card';
    el('previous-card').disabled = cardState.index === 0;
    el('next-card').disabled = cardState.index === cardState.deck.length - 1;
  }

  function updateDeck(domain, shuffle) {
    cardState.domain = domain;
    cardState.deck = cards.filter(function (card) { return domain === 'all' || card.domain === domain; });
    if (shuffle) {
      for (var i = cardState.deck.length - 1; i > 0; i -= 1) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = cardState.deck[i];
        cardState.deck[i] = cardState.deck[j];
        cardState.deck[j] = temp;
      }
    }
    cardState.index = 0;
    cardState.flipped = false;
    renderCard();
    announce('Card deck updated. ' + cardState.deck.length + ' cards. Card 1 of ' + cardState.deck.length + '.');
  }

  document.addEventListener('click', setChoiceView);
  el('previous-results-nav').addEventListener('click', showLatest);
  el('nav-start-exam').addEventListener('click', startExam);
  el('previous-question').addEventListener('click', function () { state.index -= 1; renderQuestion(); el('question-text').focus(); });
  el('next-question').addEventListener('click', function () { state.index += 1; renderQuestion(); el('question-text').focus(); });
  el('flag-question').addEventListener('click', function () {
    state.flags[state.index] = !state.flags[state.index];
    renderQuestion();
    announce(state.flags[state.index] ? 'Question flagged for review.' : 'Review flag removed.');
  });
  el('submit-exam').addEventListener('click', submitExam);
  el('domain-filter').addEventListener('change', function (event) { updateDeck(event.target.value, false); });
  el('shuffle-cards').addEventListener('click', function () { updateDeck(cardState.domain, true); });
  el('previous-card').addEventListener('click', function () { cardState.index -= 1; cardState.flipped = false; renderCard(); });
  el('next-card').addEventListener('click', function () { cardState.index += 1; cardState.flipped = false; renderCard(); });
  el('flip-card').addEventListener('click', function () { cardState.flipped = !cardState.flipped; renderCard(); announce(el('card-side-label').textContent + ': ' + el('card-content').textContent); });
  document.querySelectorAll('[data-view="exam"]').forEach(function (button) { button.addEventListener('click', startExam); });
  document.querySelectorAll('[data-view="flashcards"]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (!cardState.deck.length) updateDeck('all', false);
      showView('flashcards');
    });
  });

  checkStorage();
  initFlashcards();
  state.answers = questions.map(function () { return null; });
  state.flags = questions.map(function () { return false; });
  state.optionOrders = createOptionOrders();
  cardState.deck = cards.slice();
  renderCard();
  if (window.location.hash && views.indexOf(window.location.hash.slice(1)) !== -1) {
    showView(window.location.hash.slice(1));
  }
}());
