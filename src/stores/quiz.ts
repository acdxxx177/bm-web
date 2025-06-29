import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Question, TrueFalseQuestion, FillInTheBlanksQuestion } from '../types/question';

/**
 * @constant {object} QuestionType
 * @description 题目类型常量。
 */
const QuestionType = {
  TrueFalse: '判断题',
  FillInTheBlanks: '填空题',
  SingleChoice: '单选题',
  MultipleChoice: '多选题',
  ShortAnswer: '简答题',
} as const;

type QuestionType = typeof QuestionType[keyof typeof QuestionType];

/**
 * @interface QuizState
 * @description Quiz Store 的状态接口。
 */
interface QuizState {
  /**
   * @property {Question[]} questions - 所有加载的题目。
   */
  questions: Question[];
  /**
   * @property {number} currentQuestionIndex - 当前题目的索引。
   */
  currentQuestionIndex: number;
  /**
   * @property {number} correctAnswersCount - 正确答案的数量。
   */
  correctAnswersCount: number;
  /**
   * @property {boolean} quizStarted - 测验是否已开始。
   */
  quizStarted: boolean;
  /**
   * @property {boolean} quizFinished - 测验是否已结束。
   */
  quizFinished: boolean;
  /**
   * @property {string | boolean | string[]} userAnswer - 用户当前题目的答案。
   */
  userAnswer: string | boolean | string[] | null;
  /**
   * @property {boolean} showAnswer - 是否显示当前题目的正确答案。
   */
  showAnswer: boolean;
}

/**
 * @function useQuizStore
 * @description 定义并返回 Quiz Store。
 * @returns {object} Quiz Store 实例。
 */
export const useQuizStore = defineStore('quiz', () => {
  const questions = ref<Question[]>([]);
  const currentQuestionIndex = ref<number>(0);
  const correctAnswersCount = ref<number>(0);
  const quizStarted = ref<boolean>(false);
  const quizFinished = ref<boolean>(false);
  const userAnswer = ref<string | boolean | string[] | null>(null);
  const showAnswer = ref<boolean>(false);
  const isRetrying = ref<boolean>(false);
  const isInfiniteMode = ref<boolean>(false);
  const allAvailableQuestions = ref<Question[]>([]);
  const questionsAddedCount = ref<number>(0);
  const questionsToAddPerRound = ref<number>(2); // New state variable

  /**
   * @computed {Question | undefined} currentQuestion - 返回当前题目对象。
   */
  const currentQuestion = computed<Question | undefined>(() => {
    return questions.value[currentQuestionIndex.value];
  });

  /**
   * @computed {number} totalQuestions - 返回题目总数。
   */
  const totalQuestions = computed<number>(() => {
    return questions.value.length;
  });

  /**
   * @computed {number} percentageCorrect - 返回正确率。
   */
  const percentageCorrect = computed<number>(() => {
    if (totalQuestions.value === 0) {
      return 0;
    }
    return (correctAnswersCount.value / totalQuestions.value) * 100;
  });

  /**
   * @function loadQuestions
   * @description 从 JSON 文件加载指定数量的题目。
   * @param {number} questionCount - 要加载的题目数量。
   * @returns {Promise<void>}
   */
  async function loadQuestions(counts: { fillInTheBlank: number; trueFalse: number; isInfiniteMode?: boolean; questionsToAdd?: number }): Promise<void> {
    try {
      const trueFalseQuestionsModule = await import('../assets/question/判断题.json');
      const fillInTheBlanksQuestionsModule = await import('../assets/question/填空题.json');

      const trueFalseQuestions: TrueFalseQuestion[] = trueFalseQuestionsModule.default;
      const fillInTheBlanksQuestions: FillInTheBlanksQuestion[] = fillInTheBlanksQuestionsModule.default;

      allAvailableQuestions.value = [
        ...trueFalseQuestions.map(q => ({ ...q, type: QuestionType.TrueFalse })),
        ...fillInTheBlanksQuestions.map(q => ({ ...q, type: QuestionType.FillInTheBlanks })),
      ];

      if (counts.isInfiniteMode) {
        isInfiniteMode.value = true;
        questionsToAddPerRound.value = counts.questionsToAdd || 2; // Set the new state variable
        // For infinite mode, initially select 10 questions (5 true/false, 5 fill-in-the-blanks)
        const initialTrueFalse = trueFalseQuestions.sort(() => Math.random() - 0.5).slice(0, 5).map(q => ({ ...q, type: QuestionType.TrueFalse }));
        const initialFillInTheBlanks = fillInTheBlanksQuestions.sort(() => Math.random() - 0.5).slice(0, 5).map(q => ({ ...q, type: QuestionType.FillInTheBlanks }));
        questions.value = [...initialTrueFalse, ...initialFillInTheBlanks].sort(() => Math.random() - 0.5);
        questionsAddedCount.value = questions.value.length;

        // Fallback if not enough questions are loaded
        if (questions.value.length === 0) {
          console.warn('Not enough questions loaded for infinite mode. Generating dummy questions.');
          for (let i = 0; i < 5; i++) {
            questions.value.push({
              question: `Dummy True/False Question ${i + 1}?`,
              answer: true,
              type: QuestionType.TrueFalse,
            });
            questions.value.push({
              question: `Dummy Fill-in-the-Blanks Question ${i + 1}: __ and __`,
              answer: [`answer${i + 1}a`, `answer${i + 1}b`],
              type: QuestionType.FillInTheBlanks,
            });
          }
          questions.value = questions.value.sort(() => Math.random() - 0.5);
          questionsAddedCount.value = questions.value.length;
        }
      } else {
        isInfiniteMode.value = false;
        const selectedQuestions: Question[] = [];

        // Load specified number of true/false questions
        if (counts.trueFalse > 0) {
          const shuffledTrueFalse = trueFalseQuestions.sort(() => Math.random() - 0.5);
          selectedQuestions.push(
            ...shuffledTrueFalse.slice(0, counts.trueFalse).map(q => ({ ...q, type: QuestionType.TrueFalse }))
          );
        }

        // Load specified number of fill-in-the-blanks questions
        if (counts.fillInTheBlank > 0) {
          const shuffledFillInTheBlanks = fillInTheBlanksQuestions.sort(() => Math.random() - 0.5);
          selectedQuestions.push(
            ...shuffledFillInTheBlanks.slice(0, counts.fillInTheBlank).map(q => ({ ...q, type: QuestionType.FillInTheBlanks }))
          );
        }

        // Shuffle all selected questions
        questions.value = selectedQuestions.sort(() => Math.random() - 0.5);
      }
      console.log('Loaded questions:', questions.value);
      if (questions.value.length > 0) {
        console.log('First question type:', questions.value[0].type);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      // Fallback for load error
      questions.value = [
        {
          question: 'Error loading questions. Dummy True/False Question 1?',
          answer: true,
          type: QuestionType.TrueFalse,
        },
        {
          question: 'Error loading questions. Dummy Fill-in-the-Blanks Question 1: __ and __',
          answer: ['dummy1', 'dummy2'],
          type: QuestionType.FillInTheBlanks,
        },
      ];
      console.log('Loaded dummy questions due to error:', questions.value);
    }
  }

  /**
   * @function startQuiz
   * @description 开始测验。
   * @returns {void}
   */
  function startQuiz(): void {
    quizStarted.value = true;
    quizFinished.value = false;
    currentQuestionIndex.value = 0;
    correctAnswersCount.value = 0;
    userAnswer.value = null;
    showAnswer.value = false;
  }

  /**
   * @function submitAnswer
   * @description 提交答案，检查对错，更新分数，并显示正确答案。
   * @param {string | boolean | string[]} answer - 用户提交的答案。
   * @returns {void}
   */
  function submitAnswer(answer: string | boolean | string[], isRetryAttempt: boolean = false): void {
    userAnswer.value = answer;
    showAnswer.value = true;

    const question = currentQuestion.value;
    if (!question) {
      return;
    }

    let isCorrect = false;
    if ('answer' in question) {
      if (question.type === QuestionType.TrueFalse) {
        isCorrect = (answer === question.answer);
      } else if (question.type === QuestionType.FillInTheBlanks) {
        // 填空题答案可能包含多个，用空格分隔
        const correctAnswers = (question.answer as string[]).map(a => a.trim().toLowerCase());
        const userAnswers = (answer as string[]).map(a => a.trim().toLowerCase());
        // 严格按照顺序匹配
        if (correctAnswers.length !== userAnswers.length) {
          isCorrect = false;
        } else {
          isCorrect = correctAnswers.every((ca, index) => ca === userAnswers[index]);
        }
      }
    }

    if (isCorrect && !isRetryAttempt) {
      correctAnswersCount.value++;
    }
  }

  /**
   * @function nextQuestion
   * @description 切换到下一题。
   * @returns {void}
   */
  function nextQuestion(): void {
    console.log('nextQuestion called');
    showAnswer.value = false;
    userAnswer.value = null;
    isRetrying.value = false; // Reset retry state
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
      console.log('currentQuestionIndex:', currentQuestionIndex.value);
    } else {
      if (isInfiniteMode.value) {
        // Check accuracy and add new questions if needed
        if (percentageCorrect.value >= 90) {
          addNewQuestions(questionsToAddPerRound.value); // Use the stored value
        }
        // Reset for the next loop
        currentQuestionIndex.value = 0;
        correctAnswersCount.value = 0;
        quizFinished.value = false; // Ensure quiz is not marked as finished
        // Shuffle questions for the next round
        questions.value = questions.value.sort(() => Math.random() - 0.5);
      } else {
        quizFinished.value = true;
      }
      console.log('quizFinished:', quizFinished.value);
    }
  }

  /**
   * @function addNewQuestions
   * @description 在无限循环模式下，根据正确率增加新题目。
   * @param {number} count - 要增加的题目数量。
   * @returns {void}
   */
  function addNewQuestions(count: number): void {
    const currentQuestionIds = new Set(questions.value.map(q => q.question));
    const newQuestionsToAdd: Question[] = [];

    // Filter out questions already in the current quiz and shuffle remaining
    const availableNewQuestions = allAvailableQuestions.value.filter(
      q => !currentQuestionIds.has(q.question)
    ).sort(() => Math.random() - 0.5).map(q => ({ ...q, type: q.type }));

    for (let i = 0; i < count && i < availableNewQuestions.length; i++) {
      newQuestionsToAdd.push(availableNewQuestions[i]);
    }

    if (newQuestionsToAdd.length > 0) {
      questions.value.push(...newQuestionsToAdd);
      questionsAddedCount.value += newQuestionsToAdd.length;
      console.log(`Added ${newQuestionsToAdd.length} new questions. Total questions: ${questions.value.length}`);
    } else {
      console.log('No new questions to add.');
    }
  }

  /**
   * @function resetQuiz
   * @description 重置测验状态。
   * @returns {void}
   */
  function resetQuiz(): void {
    questions.value = [];
    currentQuestionIndex.value = 0;
    correctAnswersCount.value = 0;
    quizStarted.value = false;
    quizFinished.value = false;
    userAnswer.value = null;
    showAnswer.value = false;
    isRetrying.value = false; // Reset retry state
    isInfiniteMode.value = false;
    allAvailableQuestions.value = [];
    questionsAddedCount.value = 0;
  }

  /**
   * @function setRetrying
   * @description 设置是否处于重试状态。
   * @param {boolean} value - 是否重试。
   * @returns {void}
   */
  function setRetrying(value: boolean): void {
    isRetrying.value = value;
  }

  return {
    questions,
    currentQuestionIndex,
    correctAnswersCount,
    quizStarted,
    quizFinished,
    userAnswer,
    showAnswer,
    isRetrying,
    currentQuestion,
    totalQuestions,
    percentageCorrect,
    loadQuestions,
    startQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    setRetrying,
    questionsToAddPerRound,
  };
});
