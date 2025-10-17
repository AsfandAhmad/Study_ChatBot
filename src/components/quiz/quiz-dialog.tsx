'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Loader2, PartyPopper, RefreshCw } from 'lucide-react';
import { generateQuizAction } from '@/app/actions';
import type { Message, Course, Quiz, QuizQuestion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface QuizDialogProps {
  messages: Message[];
  course: Course;
}

type QuizState = 'loading' | 'active' | 'result';

export default function QuizDialog({ messages, course }: QuizDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [quizState, setQuizState] = React.useState<QuizState>('loading');
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = React.useState<Record<number, string>>(
    {}
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const { toast } = useToast();

  const loadQuiz = async () => {
    setQuizState('loading');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    try {
      const generatedQuiz = await generateQuizAction(messages, course);
      setQuiz(generatedQuiz);
      setQuizState('active');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate quiz.',
      });
      setOpen(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      loadQuiz();
    }
  }, [open]);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const goToNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const showResults = () => {
    setQuizState('result');
  };

  const score = React.useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.reduce((acc, question, index) => {
      return userAnswers[index] === question.answer ? acc + 1 : acc;
    }, 0);
  }, [userAnswers, quiz]);

  const progress = quiz
    ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100
    : 0;
  const currentQuestion = quiz?.questions[currentQuestionIndex];
  
  const allQuestionsAnswered = quiz ? Object.keys(userAnswers).length === quiz.questions.length : false;


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BrainCircuit className="mr-0 h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Quiz</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adaptive Quiz: {course}</DialogTitle>
          {quizState !== 'result' && (
            <DialogDescription>
              Test your knowledge on the recent topics.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-1">
          {quizState === 'loading' && <LoadingSkeleton />}
          {quizState === 'active' && currentQuestion && (
            <div>
              <Progress value={progress} className="mb-4" />
              <p className="mb-1 text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
              <h3 className="font-semibold text-lg mb-4">{currentQuestion.q}</h3>
              <RadioGroup
                value={userAnswers[currentQuestionIndex]}
                onValueChange={(value) =>
                  handleAnswerSelect(currentQuestionIndex, value)
                }
              >
                {currentQuestion.options.map((option, i) => (
                  <Label
                    key={i}
                    htmlFor={`q${currentQuestionIndex}-o${i}`}
                    className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent hover:text-accent-foreground has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                  >
                    <RadioGroupItem
                      value={option}
                      id={`q${currentQuestionIndex}-o${i}`}
                    />
                    <span>{option}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}
          {quizState === 'result' && quiz && (
            <ResultView quiz={quiz} userAnswers={userAnswers} score={score} />
          )}
        </div>

        <DialogFooter>
          {quizState === 'active' && (
            <div className="flex w-full justify-between">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              {currentQuestionIndex < quiz!.questions.length - 1 ? (
                <Button onClick={goToNext}>Next</Button>
              ) : (
                <Button onClick={showResults} disabled={!allQuestionsAnswered}>Show Results</Button>
              )}
            </div>
          )}
          {quizState === 'result' && (
            <div className="flex w-full justify-end gap-2">
               <Button variant="outline" onClick={loadQuiz}>
                <RefreshCw className="mr-2 h-4 w-4"/>
                Try Again
              </Button>
              <Button onClick={() => setOpen(false)}>Finish</Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-8 w-3/4" />
      <div className="space-y-4 pt-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

function ResultView({
  quiz,
  userAnswers,
  score,
}: {
  quiz: Quiz;
  userAnswers: Record<number, string>;
  score: number;
}) {
  const isExcellent = score / quiz.questions.length >= 0.8;
  return (
    <div>
        <div className="text-center p-6 bg-muted rounded-lg mb-6">
            <PartyPopper className={cn("mx-auto h-12 w-12 mb-4", isExcellent ? "text-green-500" : "text-amber-500")}/>
            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
            <p className="text-muted-foreground">You scored</p>
            <p className="text-4xl font-bold text-primary">{score} / {quiz.questions.length}</p>
        </div>
      {quiz.questions.map((q, i) => {
        const userAnswer = userAnswers[i];
        const isCorrect = userAnswer === q.answer;
        return (
          <Card key={i} className="mb-4">
            <CardContent className="p-4">
              <p className="font-semibold">{q.q}</p>
              <p
                className={cn(
                  'mt-2 text-sm p-2 rounded-md',
                  isCorrect ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'
                )}
              >
                Your answer: {userAnswer || 'Not answered'} {isCorrect ? ' (Correct)' : ' (Incorrect)'}
              </p>
              {!isCorrect && (
                  <p className="mt-2 text-sm p-2 rounded-md bg-muted">Correct answer: {q.answer}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground p-2 border-t">{q.why}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
