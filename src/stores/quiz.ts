import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Question, TrueFalseQuestion, FillInTheBlanksQuestion } from '../types/question.d';
import { useStatisticsStore } from './statistics';

const QuestionType = {
  TrueFalse: '判断题',
  FillInTheBlanks: '填空题',
  SingleChoice: '单选题',
  MultipleChoice: '多选题',
  ShortAnswer: '简答题',
} as const;

const MASTERY_THRESHOLD = 3; // Consecutive correct answers to master a question
const SUCCESS_RATE_THRESHOLD = 90; // Percentage to trigger question pool update

export const useQuizStore = defineStore('quiz', () => {
  // --- State ---
  const questions = ref<Question[]>([]); // Current pool of questions for the round
  const currentQuestionIndex = ref<number>(0);
  const correctAnswersCount = ref<number>(0);
  const quizStarted = ref<boolean>(false);
  const quizFinished = ref<boolean>(false);
  const userAnswer = ref<string | boolean | string[] | null>(null);
  const showAnswer = ref<boolean>(false);
  const isRetrying = ref<boolean>(false);
  const isInfiniteMode = ref<boolean>(false);

  // All questions loaded from JSON
  const allAvailableQuestions = ref<Question[]>([]);
  // Question types selected by the user
  const allowedQuestionTypes = ref<string[]>([]);

  // Infinite mode settings
  const questionsToAddOnSuccess = ref<number>(5);
  const maxQuestionsInPool = ref<number>(20);


  // --- Computed ---
  const currentQuestion = computed<Question | undefined>(() => questions.value[currentQuestionIndex.value]);
  const totalQuestions = computed<number>(() => questions.value.length);
  const percentageCorrect = computed<number>(() => {
    // In a round, percentage is based on questions answered in that round
    const answeredQuestions = currentQuestionIndex.value + (showAnswer.value ? 1 : 0);
    if (answeredQuestions === 0) return 0;
    // When quiz is finished (end of round), calculate based on all questions in the round
    if (currentQuestionIndex.value === questions.value.length -1 && showAnswer.value) {
        return (correctAnswersCount.value / questions.value.length) * 100;
    }
    // During the round, calculate based on answered questions
    return (correctAnswersCount.value / answeredQuestions) * 100;
  });


  // --- Actions ---

  /**
   * Loads questions from JSON files and initializes the quiz.
   */
  async function loadQuestions(
    counts: {
      fillInTheBlank: number;
      trueFalse: number;
      isInfiniteMode?: boolean;
      questionsToAdd?: number;
      maxQuestions?: number;
    }
  ): Promise<void> {
    try {
      const trueFalseModule = await import('../assets/question/判断题.json');
      const fillInBlanksModule = await import('../assets/question/填空题.json');

      const trueFalseQs: TrueFalseQuestion[] = trueFalseModule.default.map((q: Omit<TrueFalseQuestion, 'type'>) => ({ ...q, type: QuestionType.TrueFalse }));
      const fillInBlanksQs: FillInTheBlanksQuestion[] = fillInBlanksModule.default.map((q: Omit<FillInTheBlanksQuestion, 'type'>) => ({ ...q, type: QuestionType.FillInTheBlanks }));

      allAvailableQuestions.value = [...trueFalseQs, ...fillInBlanksQs];
      isInfiniteMode.value = counts.isInfiniteMode ?? false;

      allowedQuestionTypes.value = [];
      if (counts.trueFalse > 0) allowedQuestionTypes.value.push(QuestionType.TrueFalse);
      if (counts.fillInTheBlank > 0) allowedQuestionTypes.value.push(QuestionType.FillInTheBlanks);

      let initialQuestions: Question[] = [];
      if (counts.trueFalse > 0) {
        initialQuestions.push(...trueFalseQs.sort(() => Math.random() - 0.5).slice(0, counts.trueFalse));
      }
      if (counts.fillInTheBlank > 0) {
        initialQuestions.push(...fillInBlanksQs.sort(() => Math.random() - 0.5).slice(0, counts.fillInTheBlank));
      }
      questions.value = initialQuestions.sort(() => Math.random() - 0.5);

      if (isInfiniteMode.value) {
        questionsToAddOnSuccess.value = counts.questionsToAdd ?? 5;
        maxQuestionsInPool.value = counts.maxQuestions ?? 20;
      }

      if (questions.value.length === 0 && (counts.trueFalse > 0 || counts.fillInTheBlank > 0)) {
        console.warn('Not enough questions to start.');
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  }

  /**
   * Loads only the questions that have been answered incorrectly.
   */
  async function loadIncorrectQuestions(): Promise<void> {
    try {
      const statisticsStore = useStatisticsStore();
      const incorrectQuestionsStats = statisticsStore.getQuestionStatistics().filter(stat => stat.incorrectAttempts > 0);
      const incorrectQuestionContents = new Set(incorrectQuestionsStats.map(stat => stat.question));

      if (allAvailableQuestions.value.length === 0) {
        const trueFalseModule = await import('../assets/question/判断题.json');
        const fillInBlanksModule = await import('../assets/question/填空题.json');
        const trueFalseQs: TrueFalseQuestion[] = trueFalseModule.default.map((q: Omit<TrueFalseQuestion, 'type'>) => ({ ...q, type: QuestionType.TrueFalse }));
        const fillInBlanksQs: FillInTheBlanksQuestion[] = fillInBlanksModule.default.map((q: Omit<FillInTheBlanksQuestion, 'type'>) => ({ ...q, type: QuestionType.FillInTheBlanks }));
        allAvailableQuestions.value = [...trueFalseQs, ...fillInBlanksQs];
      }

      const incorrectQuestions = allAvailableQuestions.value.filter(q => incorrectQuestionContents.has(q.question));
      
      questions.value = incorrectQuestions.sort(() => Math.random() - 0.5);
      isInfiniteMode.value = false; // 错题训练通常不是无限模式

      if (questions.value.length === 0) {
        console.warn('No incorrect questions to practice.');
        // Optionally, handle this case in the UI
      }
    } catch (error) {
      console.error('Failed to load incorrect questions:', error);
    }
  }""

  /**
   * Starts the quiz, resetting round-specific state.
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
   * Submits the user's answer and updates statistics.
   */
  function submitAnswer(answer: string | boolean | string[], isRetryAttempt: boolean = false): void {
    userAnswer.value = answer;
    showAnswer.value = true;
    const question = currentQuestion.value;
    if (!question) return;

    let isCorrect = false;
    if (question.type === QuestionType.TrueFalse) {
      isCorrect = (answer === question.answer);
    } else if (question.type === QuestionType.FillInTheBlanks) {
      const correctAnswers = (question.answer as string[]).map(a => a.trim().toLowerCase());
      const userAnswers = (answer as string[]).map(a => a.trim().toLowerCase());
      isCorrect = correctAnswers.length === userAnswers.length && correctAnswers.every((ca, index) => ca === userAnswers[index]);
    }

    if (isCorrect && !isRetryAttempt) {
      correctAnswersCount.value++;
    }
    const statisticsStore = useStatisticsStore();
    statisticsStore.updateQuestionStats(question.question, isCorrect);
  }

  /**
   * Moves to the next question or, if the round is over, updates the question pool.
   */
  function nextQuestion(): void {
    showAnswer.value = false;
    userAnswer.value = null;
    isRetrying.value = false;

    // Check if it's the end of the round
    if (currentQuestionIndex.value >= questions.value.length - 1) {
      if (isInfiniteMode.value) {
        // Calculate final accuracy for the round
        const finalAccuracy = (correctAnswersCount.value / questions.value.length) * 100;

        if (finalAccuracy >= SUCCESS_RATE_THRESHOLD) {
          updateQuestionPool();
        }
        // If accuracy is low, the same pool will be repeated.
        
        // Reset for the next round (with either the same or new pool)
        currentQuestionIndex.value = 0;
        correctAnswersCount.value = 0;
        questions.value.sort(() => Math.random() - 0.5); // Shuffle for the next round

        if (questions.value.length === 0) {
          quizFinished.value = true; // End quiz if the pool becomes empty
        }
      } else {
        quizFinished.value = true;
      }
    } else {
      currentQuestionIndex.value++;
    }
  }

  /**
   * Updates the question pool for infinite mode based on performance.
   */
  function updateQuestionPool(): void {
    const statisticsStore = useStatisticsStore();
    const statsMap = statisticsStore.questionStats;

    // 1. Remove mastered questions from the current pool
    const masteredQuestions = new Set();
    const remainingInPool = questions.value.filter(q => {
        const stats = statsMap.get(q.question);
        if (stats && stats.consecutiveCorrectAttempts >= MASTERY_THRESHOLD) {
            masteredQuestions.add(q.question);
            return false; // Remove from pool
        }
        return true; // Keep in pool
    });
    
    const numRemoved = masteredQuestions.size;
    const numToAdd = numRemoved + questionsToAddOnSuccess.value;
    const potentialPoolSize = remainingInPool.length + numToAdd;
    const finalNumToAdd = potentialPoolSize > maxQuestionsInPool.value
        ? maxQuestionsInPool.value - remainingInPool.length
        : numToAdd;

    if (finalNumToAdd <= 0) {
        questions.value = remainingInPool;
        return;
    }

    // 2. Find new candidate questions
    // Candidates are questions of allowed types, not currently in the pool, and not mastered.
    const candidateQuestions = allAvailableQuestions.value.filter(q => {
        if (!allowedQuestionTypes.value.includes(q.type)) return false;
        if (remainingInPool.some(poolQ => poolQ.question === q.question)) return false;
        const stats = statsMap.get(q.question);
        return !stats || stats.consecutiveCorrectAttempts < MASTERY_THRESHOLD;
    });

    // 3. Prioritize candidates: unseen first, then incorrect
    const unseen = candidateQuestions.filter(q => !statsMap.has(q.question));
    const incorrect = candidateQuestions.filter(q => {
        const stats = statsMap.get(q.question);
        return stats && stats.incorrectAttempts > 0;
    });
    incorrect.sort((a, b) => {
        const statsA = statsMap.get(a.question)!;
        const statsB = statsMap.get(b.question)!;
        return statsB.incorrectAttempts - statsA.incorrectAttempts;
    });

    // Get other candidates that are neither unseen nor incorrect, but not yet mastered
    const otherCandidates = candidateQuestions.filter(
        q => !unseen.some(uq => uq.question === q.question) && !incorrect.some(iq => iq.question === q.question)
    );

    const prioritizedCandidates = [...unseen, ...incorrect, ...otherCandidates.sort(() => Math.random() - 0.5)];
    const newQuestions = prioritizedCandidates.slice(0, finalNumToAdd);

    // 4. Update the main question pool
    questions.value = [...remainingInPool, ...newQuestions];
  }


  /**
   * Resets the entire quiz state to its initial values.
   */
  function resetQuiz(): void {
    questions.value = [];
    currentQuestionIndex.value = 0;
    correctAnswersCount.value = 0;
    quizStarted.value = false;
    quizFinished.value = false;
    userAnswer.value = null;
    showAnswer.value = false;
    isRetrying.value = false;
    isInfiniteMode.value = false;
    allAvailableQuestions.value = [];
    allowedQuestionTypes.value = [];
    questionsToAddOnSuccess.value = 5;
    maxQuestionsInPool.value = 20;
  }

  /**
   * Sets the retry state for the current question.
   */
  function setRetrying(value: boolean): void {
    isRetrying.value = value;
  }

  return {
    // State
    questions,
    currentQuestionIndex,
    correctAnswersCount,
    quizStarted,
    quizFinished,
    userAnswer,
    showAnswer,
    isRetrying,
    isInfiniteMode,
    allowedQuestionTypes,
    questionsToAddOnSuccess,
    maxQuestionsInPool,

    // Computed
    currentQuestion,
    totalQuestions,
    percentageCorrect,

    // Actions
    loadQuestions,
    loadIncorrectQuestions,
    startQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    setRetrying,
  };
});
''
''
