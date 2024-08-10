import { TagInput } from '@/components/tag/tag-input';
import { Button } from '@/components/ui/button';
import { DropzoneField, Field, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { useForm } from 'react-hook-form'
import { z } from 'zod';
import { BlockEditor } from '@/components/textEditor/components/BlockEditor';
import type { JSONContent } from '@tiptap/core';
import { useMutation } from '@tanstack/react-query';
import { client } from '@/honoClient';

const validation = z.object({
  title: z.string().min(1),
  content: z.custom<JSONContent>((f) => f),
  tags: z.array(z.object({
    id: z.string().min(1),
    text: z.string().min(1),
  })),
})

type CreateArticleType = z.infer<typeof validation>

export function CreateArticleSegmentComponent() {
  const form = useForm<CreateArticleType>({
    resolver: zodResolver(validation),
    defaultValues: {
      title: '',
      content: {},
      tags: [],
    }
  });
  const [tagActiveIndex, setTagActiveIndex] = useState<number | null>(null);

  const createPostMutation = useMutation({
    mutationFn: async (_data: CreateArticleType) => {
      const resp = await client.private.articles.$post({
        json: {
          title: _data.title,
          tags: _data.tags.map(t => t.text),
          content: _data.content
        }
      })
      return resp.json()
    }
  })

  function handleSubmit(_data: CreateArticleType) {
    console.log(_data)
    createPostMutation.mutate(_data)
  }

  return (<div className='flex items-start lg:p-6 p-4 flex-col w-full'>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='contents'>
        <header className='flex items-center gap-5 py-2 justify-between w-full'>
          <h2 className='text-xl font-bold tracking-tight'>Create Article</h2>
          <Button size='sm' type='submit'>
            Save
          </Button>
        </header>

        <main className='w-full'>
          <div className='grid grid-cols-10 gap-4 p-3'>
            <div
              className='col-span-6 grid grid-cols-1 gap-2'
            >
              <Field
                control={form.control}
                label='Title'
                name='title'
                render={(f) => <Input {...f} />}
              />
              <Field
                control={form.control}
                label='Tags'
                name='tags'
                render={(f) => {
                  return <TagInput
                    autoComplete='off'
                    activeTagIndex={tagActiveIndex}
                    setActiveTagIndex={setTagActiveIndex}
                    tags={f.value}
                    setTags={f.onChange}
                  />
                }}
              />
            </div>
          </div>
          <div className='flex flex-col gap-2 p-3 col-span-5'>
            <Field
              label='Content'
              control={form.control}
              name='content'
              render={(f) => <BlockEditor
                initialContent={f.value}
                onChange={(props) => f.onChange(props.editor.getJSON())}
              />}
            />
          </div>
        </main>
      </form>
    </Form>
  </div>)
}

export const Route = createFileRoute('/(authenticated)/_layout-auth/articles/create-article')({
  component: CreateArticleSegmentComponent
})