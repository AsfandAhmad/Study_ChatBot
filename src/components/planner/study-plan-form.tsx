'use client';

import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course, StudyPlan, courses } from '@/lib/types';
import { Plus, Trash } from 'lucide-react';
import { useAuth, useFirestore, useMemoFirebase } from '@/firebase';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ScrollArea } from '../ui/scroll-area';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const planDaySchema = z.object({
  day: z.number().min(1),
  minutes: z.number().min(0),
  topics: z.array(z.string().min(1, 'Topic cannot be empty.')).min(1, 'Must have at least one topic.'),
});

const studyPlanFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  course: z.enum(['GENERAL', 'DSA', 'AI', 'DBMS', 'OS', 'NET']),
  plan: z.array(planDaySchema).min(1, 'Must have at least one day in the plan.'),
});

type StudyPlanFormData = z.infer<typeof studyPlanFormSchema>;

interface StudyPlanFormProps {
  initialPlan?: StudyPlan | null;
  currentCourse: Course;
  onSave: () => void;
  onCancel: () => void;
}

export function StudyPlanForm({ initialPlan, currentCourse, onSave, onCancel }: StudyPlanFormProps) {
  const { user } = useAuth();
  const firestore = useFirestore();

  const form = useForm<StudyPlanFormData>({
    resolver: zodResolver(studyPlanFormSchema),
    defaultValues: initialPlan ? {
      title: initialPlan.title,
      course: initialPlan.course,
      plan: initialPlan.plan
    } : {
      title: '',
      course: currentCourse,
      plan: [{ day: 1, minutes: 60, topics: [''] }],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'plan',
  });

  async function onSubmit(data: StudyPlanFormData) {
    if (!firestore || !user) return;

    const planData: StudyPlan = {
        ...data,
        createdAt: serverTimestamp() as any,
    };
    
    if (initialPlan?.id) {
        // Update existing document
        const docRef = doc(firestore, `users/${user.uid}/study-plans`, initialPlan.id);
        setDoc(docRef, planData, { merge: true }).catch(error => {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: docRef.path,
              operation: 'update',
              requestResourceData: planData,
            })
          )
        });
    } else {
        // Create new document
        const colRef = collection(firestore, `users/${user.uid}/study-plans`);
        addDoc(colRef, planData).catch(error => {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: colRef.path,
              operation: 'create',
              requestResourceData: planData,
            })
          )
        });
    }
    onSave();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ScrollArea className='h-[60vh] p-4'>
            <div className='space-y-4'>
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Week 1 Algo Prep" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {courses.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div>
                    <h3 className="text-lg font-medium mb-2">Daily Plan</h3>
                    <div className="space-y-4">
                        {fields.map((dayField, dayIndex) => (
                        <div key={dayField.id} className="rounded-lg border p-4 space-y-3 relative">
                            <div className='flex justify-between items-center'>
                                <h4 className="font-semibold">Day {dayIndex + 1}</h4>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(dayIndex)} className="text-muted-foreground hover:text-destructive">
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                            <FormField
                            control={form.control}
                            name={`plan.${dayIndex}.minutes`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Study Time (minutes)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <TopicArray fieldName={`plan.${dayIndex}.topics`} form={form} />
                        </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => append({ day: fields.length + 1, minutes: 60, topics: [''] })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Day
                        </Button>
                    </div>
                </div>
            </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Plan</Button>
        </div>
      </form>
    </Form>
  );
}


function TopicArray({ fieldName, form }: { fieldName: `plan.${number}.topics`, form: any }) {
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: fieldName,
    });
  
    return (
      <div>
        <FormLabel>Topics</FormLabel>
        <div className="space-y-2">
          {fields.map((topicField, topicIndex) => (
            <div key={topicField.id} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`${fieldName}.${topicIndex}`}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="e.g., Big O Notation" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(topicIndex)} className="shrink-0 text-muted-foreground hover:text-destructive">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append('')}>
            <Plus className="mr-2 h-4 w-4" /> Add Topic
          </Button>
        </div>
      </div>
    );
  }

    