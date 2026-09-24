'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useFeed, useCreatePost } from '@/lib/hooks/queries'
import { initials } from '@/lib/format'
import { Image as ImageIcon, Smile, Video, X, Plus } from 'lucide-react'

const FEELINGS = [
  'feeling happy',
  'feeling sad',
  'feeling excited',
  'feeling accomplished',
  'feeling grateful',
  'feeling peaceful',
  'feeling creative',
  'feeling inspired',
  'feeling thoughtful',
  'feeling determined',
]

const SAMPLE_IMAGES = [
  'https://picsum.photos/seed/new1/800/600',
  'https://picsum.photos/seed/new2/800/600',
  'https://picsum.photos/seed/new3/800/600',
  'https://picsum.photos/seed/new4/800/600',
  'https://picsum.photos/seed/new5/800/600',
]

function Composer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const feed = useFeed()
  const me = feed.data?.me
  const createPost = useCreatePost()
  const [content, setContent] = React.useState('')
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [feeling, setFeeling] = React.useState<string | null>(null)
  const [showFeelings, setShowFeelings] = React.useState(false)
  const [showImages, setShowImages] = React.useState(false)
  const taRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (open) {
      setContent('')
      setImageUrl(null)
      setFeeling(null)
      setShowFeelings(false)
      setShowImages(false)
      setTimeout(() => taRef.current?.focus(), 50)
    }
  }, [open])

  if (!me) return null

  const canPost = content.trim().length > 0

  const submit = async () => {
    if (!canPost || createPost.isPending) return
    await createPost.mutateAsync({
      content: content.trim(),
      imageUrl: imageUrl ?? undefined,
      feeling: feeling ?? undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[34rem] p-0 bg-white dark:bg-[#242526] border-[#ced4da] dark:border-[#3a3b3c]"
      >
        <DialogTitle className="sr-only">Create post</DialogTitle>
        <DialogDescription className="sr-only">
          Compose a new post
        </DialogDescription>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ced4da] dark:border-[#3a3b3c]">
          <div className="text-lg font-semibold text-[#050505] dark:text-[#e4e6eb]">
            Create post
          </div>
        </div>
        <div className="p-4">
          {/* User header */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={me.avatarUrl} alt={me.name} />
              <AvatarFallback className="bg-[#e4e6eb] text-[#050505] dark:bg-[#3a3b3c] dark:text-[#e4e6eb]">
                {initials(me.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold text-[#050505] dark:text-[#e4e6eb]">
                {me.name}
              </div>
              {feeling ? (
                <div className="text-xs text-[#1877f2] font-medium">
                  {feeling}
                </div>
              ) : null}
            </div>
          </div>

          <Textarea
            ref={taRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${me.firstName}?`}
            className="min-h-[140px] bg-transparent border-0 shadow-none focus-visible:ring-0 text-lg placeholder:text-[#65676b] dark:placeholder:text-[#b0b3b8] text-[#050505] dark:text-[#e4e6eb] resize-none px-0"
          />

          {imageUrl ? (
            <div className="relative mt-2 rounded-lg overflow-hidden border border-[#ced4da] dark:border-[#3a3b3c]">
              <img src={imageUrl} alt="post" className="w-full max-h-80 object-cover" />
              <button
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black/70"
                aria-label="Remove image"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : null}

          {/* Feeling picker */}
          {showFeelings ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {FEELINGS.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFeeling(f)
                    setShowFeelings(false)
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    feeling === f
                      ? 'bg-[#e7f0fd] border-[#1877f2] text-[#1877f2]'
                      : 'bg-[#f0f2f5] border-[#ced4da] dark:bg-[#3a3b3c] dark:border-[#3a3b3c] text-[#050505] dark:text-[#e4e6eb] hover:bg-[#e4e6eb] dark:hover:bg-[#4e4f50]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          ) : null}

          {/* Image picker */}
          {showImages ? (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {SAMPLE_IMAGES.map((src) => (
                <button
                  key={src}
                  onClick={() => {
                    setImageUrl(src)
                    setShowImages(false)
                  }}
                  className="aspect-square rounded-md overflow-hidden border border-[#ced4da] dark:border-[#3a3b3c] hover:opacity-90"
                >
                  <img src={src} alt="pick" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          {/* Add to post chips */}
          <div className="mt-4 border border-[#ced4da] dark:border-[#3a3b3c] rounded-lg p-3">
            <div className="text-sm font-semibold text-[#050505] dark:text-[#e4e6eb] mb-2">
              Add to your post
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowImages((v) => !v)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#e7f0fd] hover:bg-[#d4e4fc] text-[#1877f2]"
                aria-label="Photo/video"
                title="Photo/video"
              >
                <ImageIcon className="size-5" />
              </button>
              <button
                onClick={() => setShowFeelings((v) => !v)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#fff3d6] hover:bg-[#ffe9b3] text-[#f0a830]"
                aria-label="Feeling/activity"
                title="Feeling/activity"
              >
                <Smile className="size-5" />
              </button>
              <button
                className="grid h-9 w-9 place-items-center rounded-full bg-[#ffe0e0] hover:bg-[#ffcfcf] text-[#fa3e3e]"
                aria-label="Tag friends"
                title="Tag friends"
              >
                <Plus className="size-5" />
              </button>
              <button
                className="grid h-9 w-9 place-items-center rounded-full bg-[#e4f6e9] hover:bg-[#d2efd9] text-[#45bd62]"
                aria-label="Live video"
                title="Live video"
              >
                <Video className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <Button
            onClick={submit}
            disabled={!canPost}
            className="w-full h-10 bg-[#1877f2] hover:bg-[#166fe5] text-white disabled:bg-[#e4e6eb] disabled:text-[#bec3c9] disabled:dark:bg-[#3a3b3c] disabled:dark:text-[#65676b]"
          >
            {createPost.isPending ? 'Posting…' : 'Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CreatePost() {
  const feed = useFeed()
  const me = feed.data?.me
  const [open, setOpen] = React.useState(false)

  // Listen for the "Create" action from the header CreateMenu
  React.useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('fb:open-create-post', handler)
    return () => window.removeEventListener('fb:open-create-post', handler)
  }, [])

  if (!me) return null

  return (
    <>
      <div className="bg-white dark:bg-[#242526] rounded-lg shadow-sm p-3 mb-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={me.avatarUrl} alt={me.name} />
            <AvatarFallback className="bg-[#e4e6eb] text-[#050505] dark:bg-[#3a3b3c] dark:text-[#e4e6eb]">
              {initials(me.name)}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => setOpen(true)}
            className="flex-1 text-left h-10 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-[#e4e6eb] dark:hover:bg-[#4e4f50] px-4 leading-10 text-[#65676b] dark:text-[#b0b3b8]"
          >
            What's on your mind, {me.firstName}?
          </button>
        </div>
        <div className="h-px bg-[#ced4da] dark:bg-[#3a3b3c] my-2" />
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-sm font-medium text-[#65676b] dark:text-[#b0b3b8]"
          >
            <Video className="size-5 text-[#fa3e3e]" />
            <span className="hidden sm:inline">Live video</span>
            <span className="sm:hidden">Live</span>
          </button>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-sm font-medium text-[#65676b] dark:text-[#b0b3b8]"
          >
            <ImageIcon className="size-5 text-[#45bd62]" />
            <span className="hidden sm:inline">Photo/video</span>
            <span className="sm:hidden">Photo</span>
          </button>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-sm font-medium text-[#65676b] dark:text-[#b0b3b8]"
          >
            <Smile className="size-5 text-[#f0a830]" />
            <span className="hidden sm:inline">Feeling/activity</span>
            <span className="sm:hidden">Feeling</span>
          </button>
        </div>
      </div>
      <Composer open={open} onOpenChange={setOpen} />
    </>
  )
}
