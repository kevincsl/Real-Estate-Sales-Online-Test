/**
 * storage.js - LocalStorage 管理
 */

const Storage = {
  KEYS: {
    QUESTIONS: 'exam_questions',
    WRONG_ANSWERS: 'exam_wrong_answers',
    SETTINGS: 'exam_settings',
    QUESTION_BANK_VERSION: 'exam_question_bank_version',
    EXAM_STATE: 'exam_state'
  },

  QUESTION_BANK_VERSION: '2026-05-02-explanations-v4',

  // 取得所有題目
  getQuestions() {
    const data = localStorage.getItem(this.KEYS.QUESTIONS);
    if (data) {
      return JSON.parse(data);
    }

    if (typeof questionBank !== 'undefined' && Array.isArray(questionBank) && questionBank.length > 0) {
      this.setQuestions(questionBank);
      return questionBank;
    }

    return [];
  },

  // 儲存題目
  setQuestions(questions) {
    localStorage.setItem(this.KEYS.QUESTIONS, JSON.stringify(questions));
  },

  getQuestionBankVersion() {
    return localStorage.getItem(this.KEYS.QUESTION_BANK_VERSION) || '';
  },

  setQuestionBankVersion(version) {
    localStorage.setItem(this.KEYS.QUESTION_BANK_VERSION, version);
  },

  syncQuestionBank(seedQuestions) {
    if (!Array.isArray(seedQuestions) || seedQuestions.length === 0) {
      return this.getQuestions();
    }

    const current = this.getQuestions();
    const currentVersion = this.getQuestionBankVersion();
    const shouldRefresh =
      currentVersion !== this.QUESTION_BANK_VERSION ||
      current.length === 0 ||
      current.length < seedQuestions.length;

    if (!shouldRefresh) {
      return current;
    }

    const seedIds = new Set(seedQuestions.map(q => q.id));
    const customQuestions = current.filter(q => !seedIds.has(q.id));
    const merged = [...seedQuestions, ...customQuestions];
    this.setQuestions(merged);
    this.setQuestionBankVersion(this.QUESTION_BANK_VERSION);
    return merged;
  },

  // 新增題目
  addQuestion(question) {
    const questions = this.getQuestions();
    question.id = Date.now();
    questions.push(question);
    this.setQuestions(questions);
    return question;
  },

  // 刪除題目
  deleteQuestion(id) {
    const questions = this.getQuestions();
    const filtered = questions.filter(q => q.id !== id);
    this.setQuestions(filtered);
  },

  // 取得錯題
  getWrongAnswers() {
    const data = localStorage.getItem(this.KEYS.WRONG_ANSWERS);
    return data ? JSON.parse(data) : [];
  },

  // 新增錯題
  addWrongAnswer(questionId) {
    const wrongAnswers = this.getWrongAnswers();
    if (!wrongAnswers.includes(questionId)) {
      wrongAnswers.push(questionId);
      localStorage.setItem(this.KEYS.WRONG_ANSWERS, JSON.stringify(wrongAnswers));
    }
  },

  // 清除錯題
  clearWrongAnswers() {
    localStorage.removeItem(this.KEYS.WRONG_ANSWERS);
  },

  // 匯出題庫
  exportQuestions() {
    const questions = this.getQuestions();
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `題庫_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // 匯入題庫
  importQuestions(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (!Array.isArray(imported)) {
            reject('檔案格式不正確');
            return;
          }

          const current = this.getQuestions();
          const existingQuestions = new Set(current.map(q => `${q.category}|${q.question}`));

          // 依 category|question 過濾，只加入題庫中沒有的題目，並重新指派 id
          const newQuestions = imported
            .filter(q => q.category && q.question && q.options && q.options.length >= 2)
            .filter(q => !existingQuestions.has(`${q.category}|${q.question}`))
            .map((q, i) => ({
              category: q.category,
              question: q.question,
              options: q.options,
              answer: q.answer,
              explanation: q.explanation || '',
              optionExplanations: q.optionExplanations || [],
              lawRefs: q.lawRefs || [],
              ruleRefs: q.ruleRefs || [],
              sourceRefs: q.sourceRefs || [],
              sourceCitation: q.sourceCitation || ''
            }));

          if (newQuestions.length === 0) {
            resolve(0);
            return;
          }

          // 重新指派唯一 id，避免與現有題目衝突
          const maxId = current.reduce((m, q) => Math.max(m, q.id), 0);
          newQuestions.forEach((q, i) => { q.id = maxId + i + 1; });

          this.setQuestions([...current, ...newQuestions]);
          resolve(newQuestions.length);
        } catch (err) {
          reject('無法解析檔案');
        }
      };
      reader.onerror = () => reject('讀取檔案失敗');
      reader.readAsText(file);
    });
  },

  // 取得設定
  getSettings() {
    const data = localStorage.getItem(this.KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      examQuestionCount: 50,
      examTime: 30,
      passScore: 60
    };
  },

  // 儲存設定
  setSettings(settings) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
  },

  // 儲存考試進度
  saveExamState(state) {
    localStorage.setItem(this.KEYS.EXAM_STATE, JSON.stringify({
      ...state,
      savedAt: Date.now()
    }));
  },

  // 讀取考試進度（3 小時後過期）
  loadExamState() {
    const data = localStorage.getItem(this.KEYS.EXAM_STATE);
    if (!data) return null;
    try {
      const state = JSON.parse(data);
      const threeHours = 3 * 60 * 60 * 1000;
      if (Date.now() - state.savedAt > threeHours) {
        this.clearExamState();
        return null;
      }
      return state;
    } catch {
      return null;
    }
  },

  // 清除考試進度
  clearExamState() {
    localStorage.removeItem(this.KEYS.EXAM_STATE);
  }
};

// 匯出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
