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
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarDays, Loader2, Plus, Trash, Edit, MoreVertical } from 'lucide-react';
import { generateStudyPlanAction } from '@/app/actions';
import type { Course, StudyPlan, AiStudyPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '../ui/badge';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { StudyPlanForm } from './study-plan-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


interface StudyPlanDialogProps {
  course: Course;
}

export default function StudyPlanDialog({ course: currentCourse }: StudyPlanDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<'list' | 'edit' | 'new'>('list');
  const [selectedPlan, setSelectedPlan] = React.useState<StudyPlan | null>(null);

  const { user } = useAuth();
  const firestore = useFirestore();

  const studyPlansQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/study-plans`);
  }, [user, firestore]);

  const { data: studyPlans, isLoading: isLoadingPlans } = useCollection<StudyPlan>(studyPlansQuery);

  const handleGeneratePlan = async () => {
    if (!firestore || !user) return;
    try {
      const aiPlan: AiStudyPlan = await generateStudyPlanAction(currentCourse);
      const newPlan: StudyPlan = {
        title: `AI-Generated Plan for ${currentCourse}`,
        course: currentCourse,
        plan: aiPlan.plan,
        createdAt: serverTimestamp() as any,
      };
      
      const colRef = collection(firestore, `users/${user.uid}/study-plans`);
      addDoc(colRef, newPlan)
        .catch(error => {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: colRef.path,
              operation: 'create',
              requestResourceData: newPlan,
            })
          )
        });

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate study plan.',
      });
    }
  };
  
  const handleDeletePlan = async (planId: string) => {
    if (!firestore || !user) return;
    const docRef = doc(firestore, `users/${user.uid}/study-plans`, planId);
    deleteDoc(docRef).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
  };

  const handleEdit = (plan: StudyPlan) => {
    setSelectedPlan(plan);
    setView('edit');
  };

  const handleNew = () => {
    setSelectedPlan(null);
    setView('new');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedPlan(null);
  };
  
  const getDialogTitle = () => {
    switch (view) {
      case 'edit':
        return `Edit: ${selectedPlan?.title || 'Study Plan'}`;
      case 'new':
        return 'Create New Study Plan';
      default:
        return 'My Study Plans';
    }
  }

  React.useEffect(() => {
    if (!open) {
      // Reset view when dialog is closed
      setTimeout(() => {
        setView('list');
        setSelectedPlan(null);
      }, 200);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarDays className="mr-0 h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Plan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        
        {view === 'list' && (
          <div className="max-h-[70vh] overflow-y-auto p-1">
            <div className='flex justify-between items-center mb-4'>
              <Button onClick={handleNew}><Plus className='mr-2 h-4 w-4' /> New Plan</Button>
              <Button onClick={handleGeneratePlan} variant="secondary">Generate with AI</Button>
            </div>
            {isLoadingPlans && <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />}
            {!isLoadingPlans && (!studyPlans || studyPlans.length === 0) && (
              <div className="text-center text-muted-foreground py-12">
                <p>No study plans yet.</p>
                <p>Create a new plan or generate one with AI!</p>
              </div>
            )}
            <div className="space-y-4">
              {studyPlans?.map(plan => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Badge variant="outline">{plan.course}</Badge>
                          <span>{plan.plan.length}-day plan</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(plan)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the study plan "{plan.title}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePlan(plan.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <PlanDisplay plan={plan} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {(view === 'edit' || view === 'new') && (
          <StudyPlanForm
            initialPlan={selectedPlan}
            currentCourse={currentCourse}
            onSave={handleBackToList}
            onCancel={handleBackToList}
          />
        )}

        <DialogFooter>
          {view === 'list' && <DialogClose asChild><Button>Close</Button></DialogClose>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlanDisplay({ plan }: { plan: StudyPlan }) {
  const { toast } = useToast();
  return (
    <Accordion type="single" collapsible className="w-full">
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

    