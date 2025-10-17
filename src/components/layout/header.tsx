'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { FirefoxLogo } from '../icons/firefox-logo';
import CourseSelector from '../chat/course-selector';
import type { Course, Message } from '@/lib/types';
import QuizDialog from '../quiz/quiz-dialog';
import StudyPlanDialog from '../planner/study-plan-dialog';

interface AppHeaderProps {
  currentCourse: Course;
  setCurrentCourse: (course: Course) => void;
  messages: Message[];
}

export default function AppHeader({
  currentCourse,
  setCurrentCourse,
  messages,
}: AppHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center gap-2">
          <FirefoxLogo className="h-7 w-7 text-primary" />
          <h1 className="hidden text-lg font-semibold sm:block sm:text-xl">
            Firefox Study Tutor
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <CourseSelector
          currentCourse={currentCourse}
          setCurrentCourse={setCurrentCourse}
        />
        <QuizDialog messages={messages} course={currentCourse} />
        <StudyPlanDialog course={currentCourse} />
      </div>
    </header>
  );
}
