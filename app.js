(function () {
  'use strict';

  var ATTEMPTS_KEY = 'cpacc-study-tool-attempts-v1';
  var DIRECTION_KEY = 'cpacc-study-tool-card-direction-v1';
  var MASTERED_KEY = 'cpacc-study-tool-card-progress-v1';
  var domains = window.CPACC_DOMAINS;
  var sources = window.CPACC_SOURCE_REFERENCES;
  var original = window.CPACC_QUESTIONS.map(function (q, index) {
    return Object.assign({}, q, {
      id: 'original-' + String(index + 1).padStart(3, '0'),
      topic: 'Core CPACC knowledge',
      difficulty: 'Foundational',
      type: 'knowledge check',
      sourceId: 'iaap',
      sourceSection: q.domain
    });
  });
  var questions = original.concat(window.CPACC_EXPANDED_QUESTIONS);
  var cards = window.CPACC_FLASHCARDS;
  var views = ['home', 'learn', 'quiz', 'exam', 'results', 'flashcards', 'glossary', 'statistics', 'progress', 'review', 'resources', 'data'];
  var storage = { available: false, corrupt: false, message: '' };
  var state = { exam: null, sessionAttempts: [], quiz: null, cardDeck: [], cardIndex: 0, cardFlipped: false, cardDirection: 'term-definition', mastered: {}, missed: [], timer: 0, timerId: null };
  var el = function (id) { return document.getElementById(id); };
  var questionById = {};
  questions.forEach(function (q) { questionById[q.id] = q; });

  function announce(text) {
    var live = el('live-status');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () { live.textContent = text; }, 20);
  }
  function notify(id, text, visible) {
    var node = el(id);
    if (!node) return;
    node.textContent = text;
    if (visible !== undefined) node.hidden = !visible;
  }
  function shuffle(list) {
    var result = list.slice();
    for (var i = result.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = result[i]; result[i] = result[j]; result[j] = temp;
    }
    return result;
  }
  function showView(name) {
    if (views.indexOf(name) < 0) name = 'home';
    views.forEach(function (view) { el(view + '-view').hidden = view !== name; });
    if (name === 'flashcards') renderCard();
    if (name === 'progress') renderProgress();
    if (name === 'data') renderDataStatus();
    if (name === 'glossary') renderGlossary();
    var heading = el(name + '-title');
    if (heading) heading.focus();
    if (window.history && window.history.pushState && window.location.hash !== '#' + name) {
      window.history.pushState(null, '', '#' + name);
    }
  }
  function handleNavigation(event) {
    var link = event.target.closest('[data-view]');
    if (!link) return;
    event.preventDefault();
    showView(link.getAttribute('data-view'));
  }
  function updateStorageMessage(message) {
    storage.message = message;
    notify('exam-storage-note', message);
  }
  function checkStorage() {
    try {
      var key = '__cpacc_storage_test__';
      window.localStorage.setItem(key, 'ok');
      window.localStorage.removeItem(key);
      storage.available = true;
      updateStorageMessage('Completed exam attempts are saved only in this browser.');
    } catch (error) {
      storage.available = false;
      updateStorageMessage('Browser storage is unavailable. You can study in this tab, but attempts cannot be saved for later.');
    }
    notify('data-status', storage.available
      ? 'Results and study activity are saved in this browser only. Nothing is sent to a server.'
      : 'Browser storage is unavailable. Results cannot be saved for another visit.');
  }
  function normalizeAttempt(value) {
    if (!value || !Array.isArray(value.answers) || typeof value.date !== 'string' || !Number.isFinite(Date.parse(value.date))) return null;
    var ids = Array.isArray(value.questionIds) ? value.questionIds.slice()
      : value.answers.length === original.length ? original.map(function (q) { return q.id; }) : null;
    if (!ids || ids.length !== value.answers.length || new Set(ids).size !== ids.length ||
        ids.some(function (id) { return !questionById[id]; })) return null;
    if (value.answers.some(function (answer) { return answer !== null && (!Number.isInteger(answer) || answer < 0 || answer > 3); })) return null;
    if (value.flags && (!Array.isArray(value.flags) || value.flags.length !== ids.length ||
        value.flags.some(function (flag) { return typeof flag !== 'boolean'; }))) return null;
    if (value.timerMinutes !== undefined && [0, 60, 120].indexOf(value.timerMinutes) < 0) return null;
    var orders = value.optionOrders;
    if (!Array.isArray(orders) || orders.length !== ids.length || orders.some(function (order) {
      return !Array.isArray(order) || order.length !== 4 ||
        order.some(function (choice) { return !Number.isInteger(choice) || choice < 0 || choice > 3; }) ||
        new Set(order).size !== 4;
    })) orders = ids.map(function () { return [0, 1, 2, 3]; });
    return {
      date: value.date,
      questionIds: ids,
      answers: value.answers.slice(),
      optionOrders: orders.map(function (order) { return order.slice(); }),
      flags: Array.isArray(value.flags) && value.flags.length === ids.length ? value.flags.slice() : ids.map(function () { return false; }),
      timerMinutes: Number.isInteger(value.timerMinutes) ? value.timerMinutes : 0
    };
  }
  function readAttempts() {
    if (!storage.available) return [];
    try {
      var raw = window.localStorage.getItem(ATTEMPTS_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Saved attempts are not a list.');
      var normalized = parsed.map(normalizeAttempt);
      if (normalized.some(function (attempt) { return !attempt; })) throw new Error('Saved attempt data is invalid.');
      return normalized;
    } catch (error) {
      storage.corrupt = true;
      storage.message = 'Saved results could not be read. Existing browser data was left unchanged.';
      updateStorageMessage(storage.message);
      notify('data-status', storage.message);
      return [];
    }
  }
  function saveAttempts(attempts) {
    if (!storage.available || storage.corrupt) return false;
    try {
      window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
      return true;
    } catch (error) {
      storage.available = false;
      storage.message = 'This attempt can be reviewed in this tab, but the browser could not save it.';
      updateStorageMessage(storage.message);
      return false;
    }
  }
  function addOption(fieldset, question, choiceIndex, letter, selected, onChange) {
    var label = document.createElement('label');
    label.className = 'answer-option';
    var radio = document.createElement('input');
    radio.type = 'radio'; radio.name = 'answer'; radio.value = choiceIndex; radio.checked = selected;
    radio.setAttribute('aria-label', letter + '. ' + question.options[choiceIndex]);
    radio.addEventListener('change', function () { onChange(choiceIndex); });
    var text = document.createElement('span');
    text.textContent = letter + '. ' + question.options[choiceIndex];
    label.append(radio, text);
    fieldset.appendChild(label);
  }
  function answerOrders(set) {
    var keyPositions = shuffle(set.map(function (_, index) { return index % 4; }));
    return set.map(function (question, index) {
      var wrong = shuffle([0, 1, 2, 3].filter(function (choice) { return choice !== question.answer; }));
      wrong.splice(keyPositions[index], 0, question.answer);
      return wrong;
    });
  }
  function selectWeighted(size) {
    var quotas = size === 50 ? [20, 20, 10] : [40, 40, 20];
    var selected = [];
    domains.forEach(function (domain, index) {
      var pool = shuffle(questions.filter(function (q) { return q.domain === domain; }));
      if (pool.length < quotas[index]) throw new Error('There are not enough questions in ' + domain + ' for this exam length.');
      selected = selected.concat(pool.slice(0, quotas[index]));
    });
    return shuffle(selected);
  }
  function beginExam() {
    var size = Number(el('exam-size').value);
    try {
      var set = selectWeighted(size);
      state.exam = {
        questions: set,
        answers: set.map(function () { return null; }),
        flags: set.map(function () { return false; }),
        orders: answerOrders(set),
        index: 0
      };
    } catch (error) {
      updateStorageMessage(error.message);
      return;
    }
    el('exam-settings').hidden = true;
    el('exam-active').hidden = false;
    showView('exam');
    startTimer(Number(el('exam-timer').value));
    drawExamQuestion();
    el('question-text').focus();
    announce('Started a ' + size + '-question exam. The timer never submits automatically.');
  }
  function startTimer(minutes) {
    stopTimer();
    var display = el('exam-timer-display');
    var notice = el('timer-message');
    notice.hidden = true;
    if (!minutes) { display.hidden = true; return; }
    display.hidden = false;
    state.timer = minutes * 60;
    function tick() {
      display.textContent = 'Time remaining: ' + Math.floor(state.timer / 60) + ':' + String(state.timer % 60).padStart(2, '0');
      if (state.timer <= 0) {
        stopTimer();
        display.textContent = 'Study timer ended';
        notice.textContent = 'Your timer ended. The exam remains open and has not been submitted.';
        notice.hidden = false;
        announce('Study timer ended. Your exam remains open.');
      } else state.timer -= 1;
    }
    tick();
    state.timerId = window.setInterval(tick, 1000);
  }
  function stopTimer() {
    if (state.timerId !== null) window.clearInterval(state.timerId);
    state.timerId = null;
  }
  function drawExamQuestion() {
    if (!state.exam || !state.exam.questions.length) return;
    var exam = state.exam;
    var index = exam.index;
    var question = exam.questions[index];
    el('question-progress').textContent = 'Question ' + (index + 1) + ' of ' + exam.questions.length;
    el('question-progress-bar').max = exam.questions.length;
    el('question-progress-bar').value = index + 1;
    el('question-domain').textContent = question.domain + ' · ' + question.topic + ' · ' + question.difficulty;
    el('question-text').textContent = question.prompt;
    var fieldset = el('answer-options');
    fieldset.replaceChildren();
    exam.orders[index].forEach(function (choice, orderIndex) {
      addOption(fieldset, question, choice, String.fromCharCode(65 + orderIndex), exam.answers[index] === choice, function (selected) {
        exam.answers[index] = selected;
        drawExamNav();
        updateAnsweredCount();
      });
    });
    el('flag-question').setAttribute('aria-pressed', String(exam.flags[index]));
    el('flag-question').textContent = exam.flags[index] ? 'Remove review flag' : 'Flag for review';
    el('previous-question').disabled = index === 0;
    el('next-question').disabled = index === exam.questions.length - 1;
    drawExamNav();
    updateAnsweredCount();
  }
  function drawExamNav() {
    var list = el('question-jump-list');
    list.replaceChildren();
    state.exam.questions.forEach(function (_, index) {
      var button = document.createElement('button');
      button.type = 'button'; button.className = 'jump-button'; button.textContent = String(index + 1);
      var label = 'Question ' + (index + 1);
      if (state.exam.answers[index] !== null) label += ', answered';
      if (state.exam.flags[index]) label += ', flagged for review';
      button.setAttribute('aria-label', label);
      if (index === state.exam.index) button.setAttribute('aria-current', 'true');
      button.addEventListener('click', function () {
        state.exam.index = index;
        drawExamQuestion();
        el('question-text').focus();
      });
      list.appendChild(button);
    });
  }
  function updateAnsweredCount() {
    var count = state.exam.answers.filter(function (answer) { return answer !== null; }).length;
    el('answered-count').textContent = count + ' of ' + state.exam.questions.length + ' questions answered.';
  }
  function computeScore(attempt) {
    var result = { correct: 0, percentage: 0, byDomain: {} };
    domains.forEach(function (domain) { result.byDomain[domain] = { correct: 0, total: 0 }; });
    attempt.questionIds.forEach(function (id, index) {
      var question = questionById[id];
      result.byDomain[question.domain].total += 1;
      if (attempt.answers[index] === question.answer) {
        result.correct += 1;
        result.byDomain[question.domain].correct += 1;
      }
    });
    result.percentage = Math.round(result.correct / attempt.questionIds.length * 100);
    return result;
  }
  function sourceNote(parent, question) {
    var source = sources[question.sourceId];
    var paragraph = document.createElement('p');
    paragraph.className = 'source-note';
    if (!source) {
      paragraph.textContent = 'Source: IAAP CPACC Body of Knowledge; consult the current official edition.';
    } else {
      var link = document.createElement('a');
      link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.textContent = source.title + ' (' + source.year + ')';
      paragraph.append('Source: ', link, ' · ', source.scope, question.sourceSection ? ' Section: ' + question.sourceSection + '.' : '');
    }
    parent.appendChild(paragraph);
  }
  function renderResults(attempt, saved) {
    var score = computeScore(attempt);
    var root = el('results-content');
    root.replaceChildren();
    var summary = document.createElement('section');
    summary.className = 'result-summary';
    var heading = document.createElement('h2'); heading.textContent = 'Score';
    var result = document.createElement('p'); result.className = 'score';
    result.textContent = score.correct + ' out of ' + attempt.answers.length + ' · ' + score.percentage + '%';
    var privacy = document.createElement('p');
    privacy.textContent = saved ? 'Saved only in this browser. No results were sent to a server.' : 'This attempt is available only in this tab and was not saved.';
    summary.append(heading, result, privacy);
    root.appendChild(summary);
    var section = document.createElement('section'); section.className = 'domain-results';
    var title = document.createElement('h2'); title.textContent = 'Score by CPACC knowledge domain';
    var table = document.createElement('table');
    table.innerHTML = '<thead><tr><th scope="col">Domain</th><th scope="col">Correct</th><th scope="col">Percent</th></tr></thead>';
    var tbody = document.createElement('tbody');
    domains.forEach(function (domain) {
      var value = score.byDomain[domain];
      var row = document.createElement('tr');
      var name = document.createElement('th'); name.scope = 'row'; name.textContent = domain;
      var count = document.createElement('td'); count.textContent = value.correct + ' of ' + value.total;
      var percent = document.createElement('td'); percent.textContent = value.total ? Math.round(value.correct / value.total * 100) + '%' : '—';
      row.append(name, count, percent); tbody.appendChild(row);
    });
    table.appendChild(tbody); section.append(title, table); root.appendChild(section);
    var filter = document.createElement('label'); filter.className = 'result-tools';
    var checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = 'incorrect-only';
    filter.append(checkbox, document.createTextNode(' Show incorrect answers only')); root.appendChild(filter);
    var list = document.createElement('div'); root.appendChild(list);
    function drawReview() {
      list.replaceChildren();
      var shown = 0;
      attempt.questionIds.forEach(function (id, index) {
        var question = questionById[id];
        var correct = attempt.answers[index] === question.answer;
        if (checkbox.checked && correct) return;
        shown += 1;
        var article = document.createElement('article'); article.className = 'review-question';
        var meta = document.createElement('p'); meta.className = 'eyebrow'; meta.textContent = question.domain + ' · ' + question.topic;
        var qTitle = document.createElement('h3'); qTitle.textContent = 'Question ' + (index + 1) + ': ' + question.prompt;
        var status = document.createElement('p'); status.className = 'status-text'; status.textContent = correct ? 'Correct' : 'Incorrect';
        var selected = document.createElement('p');
        selected.textContent = attempt.answers[index] === null ? 'Your answer: No answer selected' : 'Your answer: ' + question.options[attempt.answers[index]];
        var choices = document.createElement('ul');
        attempt.optionOrders[index].forEach(function (choiceIndex) {
          var item = document.createElement('li'); item.textContent = question.options[choiceIndex];
          if (choiceIndex === question.answer) { item.className = 'answer-correct'; item.textContent += ' — Correct answer'; }
          if (choiceIndex === attempt.answers[index]) {
            item.textContent += correct ? ' — Your answer' : ' — Your answer (incorrect)';
            if (!correct) item.classList.add('answer-selected-incorrect');
          }
          choices.appendChild(item);
        });
        var explanation = document.createElement('p');
        var strong = document.createElement('strong'); strong.textContent = 'Explanation: ';
        explanation.append(strong, document.createTextNode(question.explanation));
        article.append(meta, qTitle, status, selected, choices, explanation);
        sourceNote(article, question);
        list.appendChild(article);
      });
      if (!shown) list.textContent = 'There are no incorrect answers in this attempt.';
    }
    checkbox.addEventListener('change', drawReview); drawReview();
    var actions = document.createElement('div'); actions.className = 'exam-controls';
    var another = document.createElement('button'); another.type = 'button'; another.className = 'secondary'; another.textContent = 'Set up another exam';
    another.addEventListener('click', setupExam);
    var progress = document.createElement('button'); progress.type = 'button'; progress.className = 'secondary'; progress.textContent = 'View progress';
    progress.addEventListener('click', function () { showView('progress'); });
    actions.append(another, progress); root.appendChild(actions);
  }
  function submitExam() {
    if (!state.exam || !window.confirm('Submit this exam and show the review?')) return;
    stopTimer();
    var attempt = {
      date: new Date().toISOString(),
      questionIds: state.exam.questions.map(function (q) { return q.id; }),
      answers: state.exam.answers.slice(),
      optionOrders: state.exam.orders.map(function (order) { return order.slice(); }),
      flags: state.exam.flags.slice(),
      timerMinutes: Number(el('exam-timer').value)
    };
    var score = computeScore(attempt);
    attempt.correct = score.correct; attempt.percentage = score.percentage;
    var saved = false;
    if (!storage.corrupt) {
      var attempts = readAttempts();
      if (!storage.corrupt) { attempts.push(attempt); saved = saveAttempts(attempts); }
    }
    state.sessionAttempts.push(attempt);
    el('exam-active').hidden = true;
    notify('results-storage-note', saved ? 'Attempt saved only in this browser. No results were sent to a server.' : 'Attempt available in this tab only; it was not saved.');
    renderResults(attempt, saved);
    showView('results');
    announce('Exam submitted. Score: ' + score.correct + ' out of ' + attempt.answers.length + '.');
  }
  function setupExam() {
    stopTimer();
    el('exam-settings').hidden = false;
    el('exam-active').hidden = true;
    showView('exam');
  }
  function latestAttempt() {
    var attempts = readAttempts();
    var attempt = attempts.length ? attempts[attempts.length - 1] : state.sessionAttempts[state.sessionAttempts.length - 1];
    if (!attempt) {
      notify('results-storage-note', storage.message || 'No completed attempts are available in this browser.');
      el('results-content').textContent = 'There are no completed attempts to review yet.';
      showView('results');
      return;
    }
    notify('results-storage-note', attempts.length ? 'Reviewing the latest saved attempt in this browser.' : 'Reviewing the latest attempt from this tab only.');
    renderResults(attempt, Boolean(attempts.length));
    showView('results');
  }
  function fillSelect(select, values, includeAll, allText) {
    select.replaceChildren();
    if (includeAll) {
      var all = document.createElement('option'); all.value = 'all'; all.textContent = allText || 'All'; select.appendChild(all);
    }
    values.forEach(function (value) {
      var option = document.createElement('option'); option.value = value; option.textContent = value; select.appendChild(option);
    });
  }
  function refreshQuizTopics() {
    var domain = el('quiz-domain').value;
    var previous = el('quiz-topic').value;
    var topics = Array.from(new Set(questions.filter(function (q) { return domain === 'all' || q.domain === domain; }).map(function (q) { return q.topic; }))).sort();
    fillSelect(el('quiz-topic'), topics, true, 'All topics');
    if (topics.indexOf(previous) >= 0) el('quiz-topic').value = previous;
  }
  function initQuiz() {
    fillSelect(el('quiz-domain'), domains, true, 'All domains');
    refreshQuizTopics();
    el('quiz-domain').addEventListener('change', refreshQuizTopics);
    el('start-quiz').addEventListener('click', function () {
      var type = el('quiz-type').value;
      var pool = questions.filter(function (q) {
        return (el('quiz-domain').value === 'all' || q.domain === el('quiz-domain').value) &&
          (el('quiz-topic').value === 'all' || q.topic === el('quiz-topic').value) &&
          (el('quiz-difficulty').value === 'all' || q.difficulty === el('quiz-difficulty').value) &&
          (type === 'all' || q.type === type);
      });
      if (!pool.length) { notify('quiz-feedback', 'No questions match those filters. Choose a different combination.', true); return; }
      var count = Math.min(Number(el('quiz-count').value), pool.length);
      state.quiz = { questions: shuffle(pool).slice(0, count), answers: [], index: 0 };
      el('quiz-setup').hidden = true; el('quiz-active').hidden = false;
      drawQuiz();
    });
    el('quiz-next').addEventListener('click', function () {
      if (el('quiz-next').disabled) return;
      if (state.quiz.index < state.quiz.questions.length - 1) {
        state.quiz.index += 1; drawQuiz(); return;
      }
      var correct = state.quiz.answers.filter(function (answer, index) { return answer === state.quiz.questions[index].answer; }).length;
      el('quiz-question-text').textContent = 'Quiz complete';
      el('quiz-question-meta').textContent = '';
      el('quiz-options').replaceChildren();
      notify('quiz-progress', 'Quiz complete. You answered ' + correct + ' of ' + state.quiz.questions.length + ' correctly.');
      notify('quiz-feedback', '', false);
      el('quiz-next').disabled = true; el('quiz-next').textContent = 'Quiz complete';
    });
    el('quiz-back').addEventListener('click', function () {
      el('quiz-setup').hidden = false; el('quiz-active').hidden = true; showView('quiz');
    });
  }
  function drawQuiz() {
    var quiz = state.quiz;
    var q = quiz.questions[quiz.index];
    el('quiz-progress').textContent = 'Question ' + (quiz.index + 1) + ' of ' + quiz.questions.length;
    el('quiz-progress-bar').max = quiz.questions.length;
    el('quiz-progress-bar').value = quiz.index + 1;
    el('quiz-question-meta').textContent = q.domain + ' · ' + q.topic + ' · ' + q.difficulty;
    el('quiz-question-text').textContent = q.prompt;
    var options = el('quiz-options'); options.replaceChildren();
    var legend = document.createElement('legend'); legend.className = 'sr-only'; legend.textContent = 'Choose one answer'; options.appendChild(legend);
    shuffle([0, 1, 2, 3]).forEach(function (choice, index) {
      addOption(options, q, choice, String.fromCharCode(65 + index), false, function (selected) {
        quiz.answers[quiz.index] = selected;
        var feedback = el('quiz-feedback');
        feedback.replaceChildren();
        var response = document.createElement('p');
        response.textContent = (selected === q.answer ? 'Correct. ' : 'Not quite. Correct answer: ' + q.options[q.answer] + '. ') + q.explanation;
        feedback.appendChild(response);
        el('quiz-next').disabled = false;
        sourceNote(feedback, q);
        feedback.hidden = false;
      });
    });
    el('quiz-feedback').replaceChildren();
    el('quiz-feedback').hidden = true;
    el('quiz-next').disabled = true;
    el('quiz-next').textContent = quiz.index === quiz.questions.length - 1 ? 'Finish quiz' : 'Next question';
    el('quiz-question-text').focus();
  }
  function renderModules() {
    var groups = {};
    questions.forEach(function (q) {
      var key = q.domain + '|' + q.topic;
      if (!groups[key]) groups[key] = { domain: q.domain, topic: q.topic, count: 0 };
      groups[key].count += 1;
    });
    var root = el('module-list'); root.replaceChildren();
    Object.keys(groups).sort().forEach(function (key) {
      var module = groups[key];
      var article = document.createElement('article'); article.className = 'module-card';
      var domain = document.createElement('p'); domain.className = 'eyebrow'; domain.textContent = module.domain;
      var title = document.createElement('h2'); title.textContent = module.topic;
      var summary = document.createElement('p'); summary.textContent = module.count + ' original practice questions cover this topic.';
      var button = document.createElement('button'); button.type = 'button'; button.className = 'secondary'; button.textContent = 'Practice this topic';
      button.addEventListener('click', function () {
        el('quiz-domain').value = module.domain;
        el('quiz-domain').dispatchEvent(new Event('change'));
        el('quiz-topic').value = module.topic;
        showView('quiz');
      });
      article.append(domain, title, summary, button); root.appendChild(article);
    });
  }
  function renderGlossary() {
    var query = el('glossary-search').value.trim().toLocaleLowerCase();
    var matches = cards.filter(function (card) { return (card.term + ' ' + card.definition + ' ' + card.domain).toLocaleLowerCase().indexOf(query) >= 0; });
    var root = el('glossary-list'); root.replaceChildren();
    matches.forEach(function (card) {
      var article = document.createElement('article'); article.className = 'glossary-entry';
      var domain = document.createElement('p'); domain.className = 'eyebrow'; domain.textContent = card.domain;
      var title = document.createElement('h2'); title.textContent = card.term;
      var definition = document.createElement('p'); definition.textContent = card.definition;
      article.append(domain, title, definition); root.appendChild(article);
    });
    el('glossary-count').textContent = matches.length + ' of ' + cards.length + ' terms';
  }
  function initCards() {
    fillSelect(el('domain-filter'), domains, true, 'All domains');
    try {
      var direction = window.localStorage.getItem(DIRECTION_KEY);
      if (direction === 'term-definition' || direction === 'definition-term') state.cardDirection = direction;
      var mastered = window.localStorage.getItem(MASTERED_KEY);
      if (mastered) {
        var parsed = JSON.parse(mastered);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) state.mastered = parsed;
      }
    } catch (error) {
      notify('card-preference-note', 'Saved flashcard preferences are unavailable; you can continue in this visit.', true);
    }
    var radio = document.querySelector('input[name="card-direction"][value="' + state.cardDirection + '"]');
    if (radio) radio.checked = true;
    el('domain-filter').addEventListener('change', function () { updateDeck(false); });
    el('card-search').addEventListener('input', function () { updateDeck(false); });
    el('card-status-filter').addEventListener('change', function () { updateDeck(false); });
    el('shuffle-cards').addEventListener('click', function () { updateDeck(true); });
    document.querySelectorAll('input[name="card-direction"]').forEach(function (control) {
      control.addEventListener('change', function () {
        state.cardDirection = control.value; state.cardFlipped = false;
        try { window.localStorage.setItem(DIRECTION_KEY, state.cardDirection); notify('card-preference-note', '', false); }
        catch (error) { notify('card-preference-note', 'This direction is active for this visit but could not be saved.', true); }
        renderCard();
      });
    });
    el('previous-card').addEventListener('click', function () {
      if (state.cardIndex > 0) { state.cardIndex -= 1; state.cardFlipped = false; renderCard(); }
    });
    el('next-card').addEventListener('click', function () {
      if (state.cardIndex < state.cardDeck.length - 1) { state.cardIndex += 1; state.cardFlipped = false; renderCard(); }
    });
    el('flip-card').addEventListener('click', function () {
      state.cardFlipped = !state.cardFlipped; renderCard();
      announce(el('card-side-label').textContent + ': ' + el('card-content').textContent);
    });
    el('mark-card-mastered').addEventListener('click', function () {
      var card = state.cardDeck[state.cardIndex]; if (!card) return;
      state.mastered[card.term] = !state.mastered[card.term];
      try {
        window.localStorage.setItem(MASTERED_KEY, JSON.stringify(state.mastered));
        notify('card-preference-note', 'Flashcard progress saved in this browser.', true);
      } catch (error) { notify('card-preference-note', 'Progress changed for this visit but could not be saved.', true); }
      renderCard();
    });
    updateDeck(false);
  }
  function updateDeck(shouldShuffle) {
    var domain = el('domain-filter').value || 'all';
    var search = el('card-search').value.trim().toLocaleLowerCase();
    var status = el('card-status-filter').value;
    state.cardDeck = cards.filter(function (card) {
      return (domain === 'all' || card.domain === domain) &&
        (card.term + ' ' + card.definition).toLocaleLowerCase().indexOf(search) >= 0 &&
        (status === 'all' || (status === 'known' && state.mastered[card.term]) || (status === 'review' && !state.mastered[card.term]));
    });
    if (shouldShuffle) state.cardDeck = shuffle(state.cardDeck);
    state.cardIndex = 0; state.cardFlipped = false; renderCard();
  }
  function renderCard() {
    var card = state.cardDeck[state.cardIndex];
    if (!card) {
      el('card-domain').textContent = '';
      el('card-side-label').textContent = 'No matching cards';
      el('card-content').textContent = 'Change or clear the filters to see study cards.';
      el('card-progress').textContent = 'Card 0 of 0';
      el('previous-card').disabled = true; el('next-card').disabled = true;
      el('flip-card').disabled = true; el('mark-card-mastered').disabled = true;
      return;
    }
    el('flip-card').disabled = false; el('mark-card-mastered').disabled = false;
    var showTerm = state.cardFlipped ? state.cardDirection === 'definition-term' : state.cardDirection === 'term-definition';
    el('card-domain').textContent = card.domain;
    el('card-side-label').textContent = showTerm ? 'Term' : 'Definition';
    el('card-content').textContent = showTerm ? card.term : card.definition;
    el('card-progress').textContent = 'Card ' + (state.cardIndex + 1) + ' of ' + state.cardDeck.length;
    el('previous-card').disabled = state.cardIndex === 0;
    el('next-card').disabled = state.cardIndex === state.cardDeck.length - 1;
    el('flip-card').setAttribute('aria-pressed', String(state.cardFlipped));
    el('flip-card').textContent = state.cardFlipped ? 'Show front of card' : 'Flip card';
    el('mark-card-mastered').setAttribute('aria-pressed', String(Boolean(state.mastered[card.term])));
    el('mark-card-mastered').textContent = state.mastered[card.term] ? 'Known (mark for review)' : 'Mark as known';
  }
  function latestMissed() {
    var attempts = readAttempts();
    var attempt = attempts[attempts.length - 1] || state.sessionAttempts[state.sessionAttempts.length - 1];
    state.missed = [];
    var root = el('missed-list'); root.replaceChildren();
    if (!attempt) {
      notify('review-summary', 'No completed attempt is available to review.', true);
      el('start-missed-quiz').hidden = true;
      return;
    }
    var domain = el('progress-domain').value || 'all';
    attempt.questionIds.forEach(function (id, index) {
      var q = questionById[id];
      if (attempt.answers[index] === q.answer || (domain !== 'all' && q.domain !== domain)) return;
      state.missed.push(q);
      var article = document.createElement('article'); article.className = 'review-question';
      var meta = document.createElement('p'); meta.className = 'eyebrow'; meta.textContent = q.domain + ' · ' + q.topic;
      var heading = document.createElement('h2'); heading.textContent = q.prompt;
      var selected = document.createElement('p'); selected.textContent = 'Your answer: ' + (attempt.answers[index] === null ? 'No answer selected' : q.options[attempt.answers[index]]);
      var correct = document.createElement('p'); correct.textContent = 'Correct answer: ' + q.options[q.answer];
      var explanation = document.createElement('p'); explanation.textContent = q.explanation;
      article.append(meta, heading, selected, correct, explanation); sourceNote(article, q); root.appendChild(article);
    });
    notify('review-summary', state.missed.length
      ? 'Showing ' + state.missed.length + ' missed questions from the most recent completed attempt.'
      : 'No missed questions match this filter.', true);
    el('start-missed-quiz').hidden = !state.missed.length;
  }
  function renderProgress() {
    var attempts = readAttempts();
    var latest = {};
    attempts.forEach(function (attempt) {
      attempt.questionIds.forEach(function (id, index) { latest[id] = attempt.answers[index]; });
    });
    var missedCount = Object.keys(latest).filter(function (id) { return latest[id] !== questionById[id].answer; }).length;
    var average = attempts.length ? Math.round(attempts.reduce(function (sum, attempt) { return sum + computeScore(attempt).percentage; }, 0) / attempts.length) : null;
    var values = [
      ['Completed exams', String(attempts.length)],
      ['Average score', average === null ? 'No attempts yet' : average + '%'],
      ['Questions to revisit', String(missedCount)],
      ['Study cards known', Object.keys(state.mastered).filter(function (key) { return state.mastered[key]; }).length + ' of ' + cards.length]
    ];
    var summary = el('progress-summary'); summary.replaceChildren();
    values.forEach(function (value) {
      var article = document.createElement('article'); article.className = 'choice-card';
      var heading = document.createElement('h2'); heading.textContent = value[0];
      var number = document.createElement('p'); number.className = 'score'; number.textContent = value[1];
      article.append(heading, number); summary.appendChild(article);
    });
    var history = el('attempt-history'); history.replaceChildren();
    if (!attempts.length) history.textContent = storage.corrupt ? storage.message : 'No saved attempts yet. Complete a practice exam to see local progress.';
    attempts.slice().reverse().forEach(function (attempt, reverseIndex) {
      var score = computeScore(attempt);
      var article = document.createElement('article'); article.className = 'history-entry';
      var heading = document.createElement('h3'); heading.textContent = 'Attempt ' + (attempts.length - reverseIndex) + ' · ' + score.correct + ' of ' + attempt.answers.length + ' (' + score.percentage + '%)';
      var date = document.createElement('p'); date.textContent = new Date(attempt.date).toLocaleString();
      var button = document.createElement('button'); button.type = 'button'; button.className = 'secondary'; button.textContent = 'Review attempt';
      button.addEventListener('click', function () { renderResults(attempt, true); showView('results'); });
      article.append(heading, date, button); history.appendChild(article);
    });
  }
  function renderDataStatus() {
    var attempts = readAttempts();
    notify('data-status', storage.available
      ? attempts.length + ' attempt(s) saved in this browser only. No results are sent to a server.'
      : storage.message);
  }
  function dataFeedback(message, isError) {
    var feedback = el('data-feedback');
    feedback.textContent = message;
    feedback.className = isError ? 'notice error-note' : 'notice';
    feedback.hidden = false;
  }
  function exportData() {
    var attempts = readAttempts();
    if (storage.corrupt) { dataFeedback(storage.message + ' Export was canceled to avoid an incomplete backup.', true); return; }
    var blob = new Blob([JSON.stringify({ format: 'cpacc-study-tool-results', version: 1, attempts: attempts }, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a'); link.href = url; link.download = 'cpacc-study-tool-results.json';
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    dataFeedback('Exported ' + attempts.length + ' saved attempt(s) to JSON.', false);
  }
  function importData(file) {
    if (!file) return;
    if (file.size > 2000000) { dataFeedback('Import files must be 2 MB or smaller.', true); return; }
    if (!storage.available || storage.corrupt) { dataFeedback(storage.message || 'Browser storage is unavailable.', true); return; }
    var reader = new FileReader();
    reader.onerror = function () { dataFeedback('The selected file could not be read.', true); };
    reader.onload = function () {
      var backup;
      try { backup = JSON.parse(String(reader.result)); }
      catch (error) { dataFeedback('The selected file is not valid JSON.', true); return; }
      if (!backup || backup.format !== 'cpacc-study-tool-results' || backup.version !== 1 ||
          !Array.isArray(backup.attempts) || backup.attempts.some(function (attempt) { return !normalizeAttempt(attempt); })) {
        dataFeedback('This file is not a valid CPACC Study Tool backup. No data was imported.', true);
        return;
      }
      var existing = readAttempts();
      if (storage.corrupt) { dataFeedback(storage.message + ' Import was canceled.', true); return; }
      var merged = existing.concat(backup.attempts.map(normalizeAttempt));
      if (saveAttempts(merged)) { dataFeedback('Imported ' + backup.attempts.length + ' attempt(s) into this browser.', false); renderProgress(); }
      else dataFeedback(storage.message, true);
    };
    reader.readAsText(file);
  }
  function clearData() {
    if (!window.confirm('Clear saved exam results and flashcard progress from this browser? This cannot be undone.')) return;
    try {
      window.localStorage.removeItem(ATTEMPTS_KEY);
      window.localStorage.removeItem(MASTERED_KEY);
      state.mastered = {}; state.sessionAttempts = []; storage.corrupt = false;
      dataFeedback('Saved results and flashcard progress were cleared from this browser.', false);
      renderProgress();
    } catch (error) { dataFeedback('Browser storage could not clear the saved data.', true); }
  }
  function initData() {
    el('export-data').addEventListener('click', exportData);
    el('import-data').addEventListener('change', function (event) {
      importData(event.target.files && event.target.files[0]);
      event.target.value = '';
    });
    el('clear-data').addEventListener('click', clearData);
  }
  function initProgress() {
    fillSelect(el('progress-domain'), domains, true, 'All domains');
    el('review-missed').addEventListener('click', function () { latestMissed(); showView('review'); });
    el('progress-domain').addEventListener('change', function () { if (!el('review-view').hidden) latestMissed(); });
    el('start-missed-quiz').addEventListener('click', function () {
      state.quiz = { questions: shuffle(state.missed), answers: [], index: 0 };
      el('quiz-setup').hidden = true; el('quiz-active').hidden = false;
      showView('quiz'); drawQuiz();
    });
    var historyButton = el('home-previous-results');
    if (historyButton) historyButton.addEventListener('click', latestAttempt);
  }
  function renderResources() {
    var root = el('resource-list'); root.replaceChildren();
    Object.keys(sources).forEach(function (key) {
      var source = sources[key];
      var article = document.createElement('article'); article.className = 'resource-entry';
      var title = document.createElement('h2'); title.textContent = source.title + ' (' + source.year + ')';
      var scope = document.createElement('p'); scope.textContent = source.scope;
      var link = document.createElement('a'); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.textContent = 'Open primary source (opens in a new tab)';
      article.append(title, scope, link); root.appendChild(article);
    });
  }
  function initEvents() {
    document.addEventListener('click', handleNavigation);
    el('home-start-exam').addEventListener('click', setupExam);
    el('nav-start-exam').addEventListener('click', function () {
      if (state.exam && !el('exam-active').hidden) showView('exam');
      else setupExam();
    });
    el('begin-exam').addEventListener('click', beginExam);
    el('previous-question').addEventListener('click', function () { if (state.exam.index > 0) { state.exam.index -= 1; drawExamQuestion(); el('question-text').focus(); } });
    el('next-question').addEventListener('click', function () { if (state.exam.index < state.exam.questions.length - 1) { state.exam.index += 1; drawExamQuestion(); el('question-text').focus(); } });
    el('flag-question').addEventListener('click', function () { state.exam.flags[state.exam.index] = !state.exam.flags[state.exam.index]; drawExamQuestion(); });
    el('submit-exam').addEventListener('click', submitExam);
    el('glossary-search').addEventListener('input', renderGlossary);
  }

  checkStorage();
  window.addEventListener('hashchange', function () {
    var requested = window.location.hash.slice(1);
    if (views.indexOf(requested) >= 0) showView(requested);
  });
  initEvents();
  initQuiz();
  initCards();
  initProgress();
  initData();
  renderModules();
  renderGlossary();
  renderResources();
  var initial = window.location.hash.slice(1);
  showView(views.indexOf(initial) >= 0 ? initial : 'home');
}());
