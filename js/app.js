/**
 * app.js - 主程式邏輯
 */

const app = {
  realExamConfig: {
    questionCount: 50,
    examTimeMinutes: 30,
    pointsPerQuestion: 2,
    passScore: 60
  },
  currentPage: 'home',
  questions: [],
  practiceQuestions: [],
  practiceResults: [],
  examQuestions: [],
  examAnswers: [],
  currentQuestionIndex: 0,
  examTimer: null,
  examTimeLeft: 0,
  isExamMode: false,

  init() {
    this.ensureSeedQuestions();
    this.questions = Storage.getQuestions();
    this.bindEvents();
    this.updateStats();
    this.checkInstallBanner();
    // 檢查是否已安裝，若已安裝則隱藏按鈕
    if (window.matchMedia('(display-mode: standalone)').matches) {
      document.getElementById('install-app-btn')?.classList.add('hidden');
      document.getElementById('install-banner')?.classList.add('hidden');
    }
    console.log('📚 不動產營業員線上測驗已啟動');
  },

  ensureSeedQuestions() {
    if (typeof questionBank !== 'undefined' && Array.isArray(questionBank)) {
      Storage.syncQuestionBank(questionBank);
    }
  },

  bindEvents() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        if (page === 'practice') {
          this.startPractice();
          return;
        }
        if (page === 'exam') {
          this.startExam();
          return;
        }
        this.navigate(page);
      });
    });

    document.getElementById('quick-practice-btn')?.addEventListener('click', () => this.startPractice());
    document.getElementById('quick-exam-btn')?.addEventListener('click', () => this.startExam());
    document.getElementById('quick-wrong-btn')?.addEventListener('click', () => this.navigate('wrong'));

    document.getElementById('install-btn')?.addEventListener('click', () => this.installPWA());
    document.getElementById('dismiss-btn')?.addEventListener('click', () => this.dismissBanner());
    document.getElementById('install-app-btn')?.addEventListener('click', () => this.installPWA());

    document.getElementById('prev-btn')?.addEventListener('click', () => this.prevQuestion());
    document.getElementById('next-btn')?.addEventListener('click', () => this.nextQuestion());
    document.getElementById('finish-btn')?.addEventListener('click', () => this.finishPractice());

    document.getElementById('exam-next-btn')?.addEventListener('click', () => this.nextExamQuestion());

    document.getElementById('review-wrong-btn')?.addEventListener('click', () => this.startWrongReview());
  },

  navigate(page) {
    this.currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${page}-page`)?.classList.add('active');
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    if (page === 'home') this.updateStats();
    if (page === 'wrong') this.renderWrongList();
    if (page === 'manage') this.renderQuestionList();
  },

  updateStats() {
    this.ensureSeedQuestions();
    this.questions = Storage.getQuestions();
    document.getElementById('question-count').textContent = this.questions.length;
    document.getElementById('wrong-count').textContent = Storage.getWrongAnswers().length;
  },

  startPractice() {
    this.questions = Storage.getQuestions();
    if (this.questions.length === 0) {
      alert('請先載入題庫。');
      return;
    }

    this.isExamMode = false;
    this.practiceQuestions = this.shuffleArray([...this.questions]).slice(0, 10);
    this.currentQuestionIndex = 0;
    this.practiceResults = [];

    this.navigate('practice');
    this.renderPracticeQuestion();
  },

  renderPracticeQuestion() {
    const q = this.practiceQuestions[this.currentQuestionIndex];
    document.getElementById('question-category').textContent = q.category;
    document.getElementById('question-text').textContent = q.question;

    const progress = ((this.currentQuestionIndex + 1) / this.practiceQuestions.length) * 100;
    document.getElementById('progress-text').textContent = `第 ${this.currentQuestionIndex + 1}/${this.practiceQuestions.length} 題`;
    document.getElementById('progress-fill').style.width = `${progress}%`;

    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = q.options.map((opt, i) => `
      <button class="option" data-index="${i}">${this.renderOptionContent(i, opt)}</button>
    `).join('');

    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('prev-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('finish-btn').classList.add('hidden');

    optionsContainer.querySelectorAll('.option').forEach(opt => {
      opt.addEventListener('click', () => this.selectOption(Number(opt.dataset.index)));
    });
  },

  selectOption(index) {
    const q = this.practiceQuestions[this.currentQuestionIndex];
    const isCorrect = index === q.answer;

    this.practiceResults[this.currentQuestionIndex] = isCorrect;
    if (!isCorrect) {
      Storage.addWrongAnswer(q.id);
    }

    document.querySelectorAll('#options .option').forEach((opt, i) => {
      opt.classList.add('disabled');
      if (i === q.answer) opt.classList.add('correct');
      if (i === index && !isCorrect) opt.classList.add('wrong');
    });

    const feedback = document.getElementById('feedback');
    const answerLabel = this.formatOptionLabel(q.answer, q.options[q.answer]);
    feedback.innerHTML = this.renderExplanationBlock({
      title: isCorrect ? '✅ 答對了' : `❌ 答錯了，正確答案是 ${this.escapeHtml(answerLabel)}`,
      explanation: q.explanation,
      sourceCitation: q.sourceCitation,
      optionExplanations: this.getOptionExplanations(q)
    });
    feedback.className = `feedback ${isCorrect ? 'correct' : 'wrong'}`;
    feedback.classList.remove('hidden');

    if (this.currentQuestionIndex > 0) {
      document.getElementById('prev-btn').classList.remove('hidden');
    }
    if (this.currentQuestionIndex < this.practiceQuestions.length - 1) {
      document.getElementById('next-btn').classList.remove('hidden');
    } else {
      document.getElementById('finish-btn').classList.remove('hidden');
    }
  },

  prevQuestion() {
    if (this.currentQuestionIndex === 0) return;
    this.currentQuestionIndex--;
    this.renderPracticeQuestion();
  },

  nextQuestion() {
    if (this.currentQuestionIndex >= this.practiceQuestions.length - 1) return;
    this.currentQuestionIndex++;
    this.renderPracticeQuestion();
  },

  finishPractice() {
    const correct = this.practiceResults.filter(Boolean).length;
    const total = this.practiceQuestions.length;
    const score = Math.round((correct / total) * 100);

    alert(`練習完成\n正確率：${score}% (${correct}/${total})`);
    this.navigate('home');
  },

  startExam() {
    this.questions = Storage.getQuestions();
    const examConfig = this.realExamConfig;
    if (this.questions.length < examConfig.questionCount) {
      alert(`題目不足，模擬考需要至少 ${examConfig.questionCount} 題，目前只有 ${this.questions.length} 題。`);
      return;
    }

    const saved = Storage.loadExamState();
    if (saved) {
      if (!confirm(`偵測到上次未完成的考試（已作答 ${saved.examAnswers.filter(a => a !== null).length} 題），是否繼續？`)) {
        Storage.clearExamState();
      } else {
        this.resumeExam(saved);
        return;
      }
    }

    this.isExamMode = true;
    this.examQuestions = this.shuffleArray([...this.questions]).slice(0, examConfig.questionCount);
    this.examAnswers = new Array(this.examQuestions.length).fill(null);
    this.currentQuestionIndex = 0;
    this.examTimeLeft = examConfig.examTimeMinutes * 60;

    clearInterval(this.examTimer);
    document.querySelector('.timer')?.classList.remove('warning');

    const review = document.getElementById('exam-review');
    if (review) {
      review.classList.add('hidden');
      review.innerHTML = '';
    }

    this.navigate('exam');
    this.startTimer();
    this.renderExamQuestion();
  },

  resumeExam(saved) {
    this.isExamMode = true;
    this.examQuestions = saved.examQuestions;
    this.examAnswers = saved.examAnswers;
    this.currentQuestionIndex = saved.currentQuestionIndex ?? 0;
    this.examTimeLeft = saved.examTimeLeft;

    clearInterval(this.examTimer);
    document.querySelector('.timer')?.classList.remove('warning');

    const review = document.getElementById('exam-review');
    if (review) {
      review.classList.add('hidden');
      review.innerHTML = '';
    }

    this.navigate('exam');
    this.startTimer();
    this.renderExamQuestion();
  },

  startTimer() {
    clearInterval(this.examTimer);
    this.updateTimerDisplay();
    this.examTimer = setInterval(() => {
      this.examTimeLeft--;
      this.updateTimerDisplay();
      if (this.examTimeLeft <= 0) {
        this.finishExam();
      }
    }, 1000);
  },

  updateTimerDisplay() {
    const minutes = Math.max(0, Math.floor(this.examTimeLeft / 60));
    const seconds = Math.max(0, this.examTimeLeft % 60);
    document.getElementById('timer-display').textContent =
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const timer = document.querySelector('.timer');
    if (!timer) return;
    timer.classList.toggle('warning', this.examTimeLeft <= 60);
  },

  renderExamQuestion() {
    const q = this.examQuestions[this.currentQuestionIndex];
    document.getElementById('exam-progress-text').textContent =
      `第 ${this.currentQuestionIndex + 1}/${this.examQuestions.length} 題`;
    document.getElementById('exam-question-text').textContent = q.question;

    const optionsContainer = document.getElementById('exam-options');
    optionsContainer.innerHTML = q.options.map((opt, i) => `
      <button class="option ${this.examAnswers[this.currentQuestionIndex] === i ? 'selected' : ''}"
              data-index="${i}">${this.renderOptionContent(i, opt)}</button>
    `).join('');

    optionsContainer.querySelectorAll('.option').forEach(opt => {
      opt.addEventListener('click', () => this.selectExamOption(Number(opt.dataset.index)));
    });
  },

  selectExamOption(index) {
    this.examAnswers[this.currentQuestionIndex] = index;
    document.querySelectorAll('#exam-options .option').forEach((opt, i) => {
      opt.classList.toggle('selected', i === index);
    });
    this.saveExamProgress();
  },

  nextExamQuestion() {
    if (this.examAnswers[this.currentQuestionIndex] === null) {
      if (!confirm('這一題尚未作答，仍要前往下一題嗎？')) return;
    }

    this.saveExamProgress();

    if (this.currentQuestionIndex < this.examQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.renderExamQuestion();
      return;
    }

    if (confirm('已到最後一題，是否立即交卷？')) {
      this.finishExam();
    }
  },

  finishExam() {
    clearInterval(this.examTimer);
    Storage.clearExamState();
    this.isExamMode = false;

    let correct = 0;
    this.examQuestions.forEach((q, i) => {
      if (this.examAnswers[i] === q.answer) {
        correct++;
      } else {
        Storage.addWrongAnswer(q.id);
      }
    });

    const total = this.examQuestions.length;
    const examConfig = this.realExamConfig;
    const score = correct * examConfig.pointsPerQuestion;
    const passed = score >= examConfig.passScore;
    const correctRate = Math.round((correct / total) * 100);

    alert(
      `考試完成\n\n答對：${correct}/${total} 題\n得分：${score}/100 分（每題 ${examConfig.pointsPerQuestion} 分）\n正確率：${correctRate}%\n及格分數：${examConfig.passScore} 分\n結果：${passed ? '及格' : '未及格'}`
    );
    this.renderExamReview(correct, total, score, correctRate, passed);
  },

  renderExamReview(correct, total, score, correctRate, passed) {
    const review = document.getElementById('exam-review');
    const items = this.examQuestions.map((q, idx) => {
      const selected = this.examAnswers[idx];
      const selectedText = selected === null ? '未作答' : this.formatOptionLabel(selected, q.options[selected]);
      const correctText = this.formatOptionLabel(q.answer, q.options[q.answer]);

      return `
        <div class="review-item">
          <p><strong>第 ${idx + 1} 題</strong> ${this.escapeHtml(q.question)}</p>
          <p>你的答案：${this.escapeHtml(selectedText)}</p>
          <p>正確答案：${this.escapeHtml(correctText)}</p>
          ${this.renderExplanationBlock({
            explanation: q.explanation,
            sourceCitation: q.sourceCitation,
            optionExplanations: this.getOptionExplanations(q)
          })}
        </div>
      `;
    }).join('');

    review.innerHTML = `
      <h3>作答檢討</h3>
      <p>答對 ${correct}/${total} 題，得分 ${score}/100 分，正確率 ${correctRate}%，結果：${passed ? '及格' : '未及格'}。</p>
      ${items}
      <div class="actions">
        <button class="btn primary" onclick="app.navigate('home')">返回首頁</button>
      </div>
    `;
    review.classList.remove('hidden');
  },

  renderExplanationBlock({ title = '', explanation = '', sourceCitation = '', optionExplanations = [] }) {
    const titleHtml = title ? `<p class="feedback-title">${title}</p>` : '';
    const explanationHtml = explanation
      ? `<p class="explanation-main">${this.escapeHtml(explanation)}</p>`
      : '';
    const sourceHtml = sourceCitation
      ? `<p class="explanation-source">出處：${this.escapeHtml(sourceCitation)}</p>`
      : '';
    const labels = ['A', 'B', 'C', 'D'];
    const listHtml = optionExplanations.length
      ? `<ul class="explanation-list">${optionExplanations.map((exp, i) =>
          `<li><strong>${labels[i] || String(i + 1)}.</strong> ${this.escapeHtml(exp)}</li>`
        ).join('')}</ul>`
      : '';

    return `${titleHtml}${explanationHtml}${sourceHtml}${listHtml}`;
  },

  getOptionExplanations(q) {
    const label = String.fromCharCode(65 + q.answer);
    if (Array.isArray(q.optionExplanations) && q.optionExplanations[q.answer]) {
      return [q.optionExplanations[q.answer]];
    }
    return [`選項${label}為正確答案。`];
  },

  formatOptionLabel(index, text) {
    return `${String.fromCharCode(65 + index)}. ${text}`;
  },

  renderOptionContent(index, text) {
    const label = String.fromCharCode(65 + index);
    return `
      <span class="option-label">${label}</span>
      <span class="option-text">${this.escapeHtml(text)}</span>
    `;
  },

  escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  renderWrongList() {
    const wrongIds = Storage.getWrongAnswers();
    document.getElementById('wrong-total').textContent = wrongIds.length;

    const btn = document.getElementById('review-wrong-btn');
    btn.disabled = wrongIds.length === 0;

    if (wrongIds.length === 0) {
      document.getElementById('wrong-list').innerHTML = '<p>目前沒有錯題記錄</p>';
      return;
    }

    const allQuestions = Storage.getQuestions();
    const wrongQuestions = wrongIds
      .map(id => allQuestions.find(q => q.id === id))
      .filter(Boolean);

    document.getElementById('wrong-list').innerHTML = wrongQuestions.map(q => `
      <div class="wrong-item">
        <p class="question">${this.escapeHtml(q.question)}</p>
        <span class="category">${this.escapeHtml(q.category)}</span>
      </div>
    `).join('');
  },

  startWrongReview() {
    const wrongIds = Storage.getWrongAnswers();
    if (wrongIds.length === 0) return;

    const allQuestions = Storage.getQuestions();
    this.practiceQuestions = wrongIds
      .map(id => allQuestions.find(q => q.id === id))
      .filter(Boolean);

    this.isExamMode = false;
    this.currentQuestionIndex = 0;
    this.practiceResults = [];

    this.navigate('practice');
    this.renderPracticeQuestion();
  },

  renderQuestionList() {
    this.questions = Storage.getQuestions();

    if (this.questions.length === 0) {
      document.getElementById('question-list').innerHTML = '<p>尚無題目，請新增</p>';
      return;
    }

    document.getElementById('question-list').innerHTML = this.questions.map(q => `
      <div class="manage-item" data-id="${q.id}">
        <h4>${this.escapeHtml(q.question.substring(0, 60))}${q.question.length > 60 ? '...' : ''}</h4>
        <div class="meta">
          <span>${this.escapeHtml(q.category)}</span>
          <span>正確答案：${this.escapeHtml(q.options[q.answer])}</span>
          <button class="btn-delete" data-id="${q.id}" title="刪除此題">✕</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        if (confirm('確定要刪除這題嗎？')) {
          Storage.deleteQuestion(id);
          this.renderQuestionList();
          this.updateStats();
        }
      });
    });
  },

  showAddQuestion() {
    const category = prompt('題目分類：');
    if (!category) return;

    const question = prompt('題目內容：');
    if (!question) return;

    const options = [];
    for (let i = 0; i < 4; i++) {
      const opt = prompt(`選項 ${String.fromCharCode(65 + i)}：`);
      if (!opt) return;
      options.push(opt);
    }

    const answer = Number(prompt('正確答案索引（0-3）：'));
    if (!Number.isInteger(answer) || answer < 0 || answer > 3) {
      alert('請輸入 0 到 3。');
      return;
    }

    Storage.addQuestion({
      category,
      question,
      options,
      answer,
      explanation: '',
      optionExplanations: []
    });
    alert('題目已新增。');
    this.renderQuestionList();
    this.updateStats();
  },

  exportQuestions() {
    Storage.exportQuestions();
  },

  importQuestions() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;

      Storage.importQuestions(file)
        .then(count => {
          alert(`已匯入 ${count} 題。`);
          this.updateStats();
          this.renderQuestionList();
        })
        .catch(err => alert(`匯入失敗：${err}`));
    };
    input.click();
  },

  deferredPrompt: null,

  checkInstallBanner() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
      document.getElementById('install-banner')?.classList.remove('hidden');
      document.getElementById('install-app-btn')?.classList.remove('hidden');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      document.getElementById('install-banner')?.classList.add('hidden');
      document.getElementById('install-app-btn')?.classList.add('hidden');
    });
  },

  async installPWA() {
    if (!this.deferredPrompt) {
      alert('此瀏覽器不支援安裝 App，或網站已以安裝模式執行。請使用 Chrome/Edge/Safari 開啟後長按右上角選單選取「加到主畫面」。');
      return;
    }
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      this.deferredPrompt = null;
    }
  },

  dismissBanner() {
    document.getElementById('install-banner')?.classList.add('hidden');
  },

  saveExamProgress() {
    Storage.saveExamState({
      examQuestions: this.examQuestions,
      examAnswers: this.examAnswers,
      currentQuestionIndex: this.currentQuestionIndex,
      examTimeLeft: this.examTimeLeft
    });
  },

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
