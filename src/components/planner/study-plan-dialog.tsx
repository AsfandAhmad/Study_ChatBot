'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarDays, Loader2 } from 'lucide-react';
import { generateStudyPlanAction } from '@/app/actions';
import type { Course, StudyPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '../ui/badge';

interface StudyPlanDialogProps {
  course: Course;
}

export default function StudyPlanDialog({ course }: StudyPlanDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [studyPlan, setStudyPlan] = React.useState<StudyPlan | null>(null);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setStudyPlan(null);
    try {
      const plan = await generateStudyPlanAction(course);
      setStudyPlan(plan);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate study plan.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      handleGeneratePlan();
    }
  }, [open, course]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarDays className="mr-0 h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Plan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Your 7-Day Study Plan for {course}</DialogTitle>
          <DialogDescription>
            Here is a personalized study plan to help you master the material.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-1">
          {isLoading && <LoadingSkeleton />}
          {studyPlan && <PlanDisplay plan={studyPlan} />}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-2">
          <div className="h-6 w-1/3 animate-pulse rounded bg-muted"></div>
          <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
        </div>
      ))}
    </div>
  );
}


function PlanDisplay({ plan }: { plan: StudyPlan }) {
  return (
    <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
      {plan.plan.map((day, index) => (
        <AccordionItem key={day.day} value={`item-${index}`}>
          <AccordionTrigger>
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg">Day {day.day}</span>
              <Badge variant="secondary">{day.minutes} min</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc space-y-2 pl-6">
              {day.topics.map((topic, i) => (
                <li key={i}>{topic}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
