export interface QuestionWithOptions {
  id: string;
  type: string;
  text: string;
  marks: number;
  explanation?: string | null;
  expectedAnswer?: string | null;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

export interface StudentAnswerInput {
  questionId: string;
  selectedOptionId?: string | null;
  textAnswer?: string | null;
}

export interface EvaluatedQuestionResult {
  questionId: string;
  isCorrect: boolean;
  marksAwarded: number;
  selectedOptionId?: string | null;
  textAnswer?: string | null;
  correctAnswerText: string;
  explanation?: string | null;
}

export interface EvaluationOutcome {
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean | null;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  evaluatedAnswers: EvaluatedQuestionResult[];
}

export function evaluateAttempt(
  questions: QuestionWithOptions[],
  answers: StudentAnswerInput[],
  passingScorePercentage?: number | null
): EvaluationOutcome {
  let score = 0;
  let totalMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const answerMap = new Map<string, StudentAnswerInput>();
  answers.forEach((ans) => answerMap.set(ans.questionId, ans));

  const evaluatedAnswers: EvaluatedQuestionResult[] = [];

  for (const q of questions) {
    const qMarks = q.marks > 0 ? q.marks : 1;
    totalMarks += qMarks;

    const studentAns = answerMap.get(q.id);
    let isCorrect = false;
    let correctAnswerText = '';

    if (q.type === 'MCQ') {
      const correctOption = q.options.find((opt) => opt.isCorrect);
      correctAnswerText = correctOption ? correctOption.text : 'No correct option set';

      if (!studentAns || !studentAns.selectedOptionId) {
        unansweredCount++;
        isCorrect = false;
      } else {
        const studentSelectedOption = q.options.find((opt) => opt.id === studentAns.selectedOptionId);
        if (studentSelectedOption && studentSelectedOption.isCorrect) {
          isCorrect = true;
          correctCount++;
        } else {
          incorrectCount++;
        }
      }
    } else if (q.type === 'SHORT_ANSWER') {
      correctAnswerText = q.expectedAnswer ? q.expectedAnswer.trim() : '';

      if (!studentAns || !studentAns.textAnswer || studentAns.textAnswer.trim() === '') {
        unansweredCount++;
        isCorrect = false;
      } else {
        const studentText = studentAns.textAnswer.trim().toLowerCase();
        // Support multiple acceptable variations separated by semicolons or pipe, or single match
        const acceptableAnswers = (q.expectedAnswer || '')
          .split(/[;|]/)
          .map((a) => a.trim().toLowerCase())
          .filter((a) => a.length > 0);

        if (acceptableAnswers.length > 0 && acceptableAnswers.includes(studentText)) {
          isCorrect = true;
          correctCount++;
        } else if (studentText === (q.expectedAnswer || '').trim().toLowerCase()) {
          isCorrect = true;
          correctCount++;
        } else {
          incorrectCount++;
        }
      }
    }

    const marksAwarded = isCorrect ? qMarks : 0;
    score += marksAwarded;

    evaluatedAnswers.push({
      questionId: q.id,
      isCorrect,
      marksAwarded,
      selectedOptionId: studentAns?.selectedOptionId || null,
      textAnswer: studentAns?.textAnswer || null,
      correctAnswerText,
      explanation: q.explanation || null,
    });
  }

  const rawPercentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  const percentage = Math.round(rawPercentage * 10) / 10;

  const passed =
    passingScorePercentage !== undefined && passingScorePercentage !== null
      ? percentage >= passingScorePercentage
      : null;

  return {
    score,
    totalMarks,
    percentage,
    passed,
    correctCount,
    incorrectCount,
    unansweredCount,
    evaluatedAnswers,
  };
}
