import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLearningStore } from "../../stores/learningStore";
import { useBillingStore } from "../../stores/billingStore";
import type { Subject } from "../../types/domain";
import { getOpenAiApiKey } from "../../utils/settings";
import QuizLoadingCard from "./quizzes/QuizLoadingCard";
import QuizRunner from "./quizzes/QuizRunner";
import QuizSetupCard from "./quizzes/QuizSetupCard";
import { hashToStudentId } from "./quizzes/quizTypes";
import { formatSubjectLabel } from "./quizzes/quizTypes";
import { useQuizTimer } from "./quizzes/useQuizTimer";
import { useQuizAttempt } from "./quizzes/useQuizAttempt";

export default function Quizzes() {
  const { user } = useAuth();
  const { updateStudyStat, addStudySession } = useLearningStore();
  const billing = useBillingStore();

  const hasApiKey = Boolean(getOpenAiApiKey());
  const [selectedSubject, setSelectedSubject] = useState<Subject>("integrated_science");
  const [savedResult, setSavedResult] = useState(false);
  const userRef = user?.email ?? user?.id;

  const quiz = useQuizAttempt();
  const timeLeftMs = useQuizTimer(quiz.phase === "active", quiz.endsAtMs);

  const studentId = useMemo(() => hashToStudentId(userRef ?? "guest@wassce.ai"), [userRef]);
  const subjectLabel = useMemo(() => formatSubjectLabel(selectedSubject), [selectedSubject]);
  const premium = useMemo(() => billing.isPremium(userRef), [billing, userRef]);
  const canUseAi = hasApiKey && premium;

  useEffect(() => {
    if (quiz.phase !== "finished") return;
    if (savedResult) return;
    if (quiz.questions.length === 0) return;

    const today = new Date().toISOString().split("T")[0];
    updateStudyStat({
      subject: selectedSubject,
      topic: quiz.source === "ai" ? "ai-quiz" : "sample-quiz",
      accuracy: quiz.accuracy,
      attempts: quiz.questions.length,
    });
    addStudySession({
      id: `quiz-${Date.now()}`,
      subject: subjectLabel,
      durationMinutes: Math.max(10, Math.round((quiz.questions.length * 90) / 60)),
      completed: true,
      date: today,
      kind: "quiz",
      notes: `Quiz completed: ${quiz.accuracy}%`,
      topic: quiz.source === "ai" ? "AI quiz" : "Sample quiz",
    });
    setSavedResult(true);
  }, [addStudySession, quiz, savedResult, selectedSubject, subjectLabel, updateStudyStat]);

  if (quiz.phase === "setup") {
    return (
      <QuizSetupCard
        selectedSubject={selectedSubject}
        onSelectedSubject={(subject) => {
          setSelectedSubject(subject);
          setSavedResult(false);
        }}
        onLaunch={() => {
          setSavedResult(false);
          void quiz.launch(selectedSubject, canUseAi);
        }}
        hasApiKey={hasApiKey}
        premium={premium}
        generationError={quiz.generationError}
        disabled={false}
      />
    );
  }

  if (quiz.phase === "loading") {
    return <QuizLoadingCard subjectLabel={subjectLabel} onBack={quiz.backToSetup} />;
  }

  return (
      <QuizRunner
        subject={selectedSubject}
        questions={quiz.questions}
      currentIndex={quiz.currentIndex}
      answers={quiz.answers}
      flaggedIds={quiz.flaggedIds}
      paletteCollapsed={quiz.paletteCollapsed}
      timeLeftMs={timeLeftMs}
      progressPercent={quiz.progressPercent}
      isFinished={quiz.phase === "finished"}
      showReviewAnswers={quiz.showReviewAnswers}
      score={quiz.score}
      accuracy={quiz.accuracy}
        savedResult={savedResult}
        studentId={studentId}
        hasApiKey={hasApiKey}
        premium={premium}
        onCollapsePalette={() => quiz.setPaletteCollapsed(true)}
        onExpandPalette={() => quiz.setPaletteCollapsed(false)}
        onJump={(index) => quiz.jumpTo(index)}
      onPrev={quiz.prev}
      onNext={quiz.next}
      onToggleFlag={quiz.toggleFlag}
      onSelectAnswer={quiz.setAnswer}
      onFinish={() => {
        quiz.finish();
        setSavedResult(false);
      }}
      onReset={() => {
        quiz.reset();
        setSavedResult(false);
      }}
      onToggleShowAnswers={quiz.setShowReviewAnswers}
    />
  );
}
