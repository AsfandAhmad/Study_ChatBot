'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { courses, type Course } from '@/lib/types';

interface CourseSelectorProps {
  currentCourse: Course;
  setCurrentCourse: (course: Course) => void;
}

export default function CourseSelector({
  currentCourse,
  setCurrentCourse,
}: CourseSelectorProps) {
  return (
    <Select
      value={currentCourse}
      onValueChange={(value) => setCurrentCourse(value as Course)}
    >
      <SelectTrigger className="w-[120px] text-xs sm:w-[180px] sm:text-sm">
        <SelectValue placeholder="Select course" />
      </SelectTrigger>
      <SelectContent>
        {courses.map((course) => (
          <SelectItem key={course.value} value={course.value}>
            {course.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
