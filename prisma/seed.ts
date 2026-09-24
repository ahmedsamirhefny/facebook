import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const db = new PrismaClient()

// Deterministic avatar generator using DiceBear-style via pravatar (real photos)
const avatar = (seed: number) => `https://i.pravatar.cc/300?img=${seed}`
const cover = (seed: number) => `https://picsum.photos/seed/cover${seed}/1200/400`
const postImg = (seed: number, w = 800, h = 600) => `https://picsum.photos/seed/post${seed}/${w}/${h}`
const storyImg = (seed: number) => `https://picsum.photos/seed/story${seed}/400/700`

const users = [
  { email: 'you@facebook.local', firstName: 'Alex', lastName: 'Morgan', work: 'Product Designer at Meta', education: 'Stanford University', location: 'San Francisco, CA', bio: 'Coffee enthusiast. Designing delightful experiences. ☕' },
  { email: 'sarah.chen@facebook.local', firstName: 'Sarah', lastName: 'Chen', work: 'Software Engineer at Google', education: 'MIT', location: 'Mountain View, CA', bio: 'Building things that scale. Dog mom 🐕' },
  { email: 'mike.johnson@facebook.local', firstName: 'Mike', lastName: 'Johnson', work: 'Photographer', education: 'RISD', location: 'Brooklyn, NY', bio: 'Capturing light & moments. 📷' },
  { email: 'emma.wilson@facebook.local', firstName: 'Emma', lastName: 'Wilson', work: 'Marketing Lead at Spotify', education: 'NYU', location: 'New York, NY', bio: 'Music is life 🎧' },
  { email: 'david.kim@facebook.local', firstName: 'David', lastName: 'Kim', work: 'Founder at StartupX', education: 'Harvard Business School', location: 'Austin, TX', bio: 'Entrepreneur. Coffee addict. Triathlete.' },
  { email: 'lisa.brown@facebook.local', firstName: 'Lisa', lastName: 'Brown', work: 'Chef at Bistro 22', education: 'Culinary Institute of America', location: 'Portland, OR', bio: 'Food is art. 🍝' },
  { email: 'tom.davis@facebook.local', firstName: 'Tom', lastName: 'Davis', work: 'Travel Blogger', education: 'UCLA', location: 'Bali, Indonesia', bio: '30 countries and counting ✈️' },
  { email: 'jenny.lee@facebook.local', firstName: 'Jenny', lastName: 'Lee', work: 'UX Researcher at Figma', education: 'UC Berkeley', location: 'Seattle, WA', bio: 'Understanding humans, one study at a time.' },
  { email: 'mark.garcia@facebook.local', firstName: 'Mark', lastName: 'Garcia', work: 'Architect', education: 'Yale', location: 'Chicago, IL', bio: 'Designing spaces that breathe.' },
  { email: 'nina.patel@facebook.local', firstName: 'Nina', lastName: 'Patel', work: 'Data Scientist at Netflix', education: 'Carnegie Mellon', location: 'Los Gatos, CA', bio: 'Numbers tell stories too. 📊' },
  { email: 'carl.white@facebook.local', firstName: 'Carl', lastName: 'White', work: 'Musician', education: 'Berklee', location: 'Nashville, TN', bio: 'Six strings, infinite possibilities. 🎸' },
  { email: 'olivia.green@facebook.local', firstName: 'Olivia', lastName: 'Green', work: 'Yoga Instructor', education: 'Self-taught', location: 'Sedona, AZ', bio: 'Breathe in, breathe out. 🧘‍♀️' },
]

const posts = [
  { authorIdx: 1, content: "Just shipped a new feature at work today! Three months of hard work finally live. So proud of the team. 🚀", imgSeed: 101, feeling: 'feeling accomplished' },
  { authorIdx: 2, content: "Golden hour in Brooklyn today. The light was absolutely perfect. #photography #nyc", imgSeed: 102, feeling: 'feeling creative' },
  { authorIdx: 3, content: "Our new campaign just went live! Huge thanks to the whole team for making this happen. Couldn't have done it without you all. 💚", imgSeed: 103, feeling: 'feeling grateful' },
  { authorIdx: 4, content: "Pitch day was intense but we got the funding! $2M seed round closed. Time to build something that matters.", imgSeed: 104, feeling: 'feeling excited' },
  { authorIdx: 5, content: "Tonight's special: hand-rolled gnocchi with brown butter sage sauce and toasted hazelnuts. Made with love. 🍝", imgSeed: 105, feeling: 'feeling delicious' },
  { authorIdx: 6, content: "Watching the sunset from a cliff in Uluwatu. Some moments make you realize how tiny we are. 🌅", imgSeed: 106, feeling: 'feeling peaceful' },
  { authorIdx: 7, content: "Just finished a fascinating user study. Turns out people don't read, they scan. Designing for that changes everything.", imgSeed: 0, feeling: 'feeling thoughtful' },
  { authorIdx: 8, content: "The new pavilion is finally complete. Eighteen months of sketches, models, and sleepless nights. Worth every minute.", imgSeed: 108, feeling: 'feeling proud' },
  { authorIdx: 9, content: "Fun fact: Netflix's recommendation algorithm processes data from 200+ million subscribers. The patterns we find are wild.", imgSeed: 0, feeling: 'feeling nerdy' },
  { authorIdx: 10, content: "New track dropping Friday. Recorded this one in a cabin in the woods with just a guitar and a mic. Raw and real. 🎶", imgSeed: 109, feeling: 'feeling inspired' },
  { authorIdx: 0, content: "Redesigned my portfolio this weekend. Less is more. Curious what you all think — feedback welcome!", imgSeed: 110, feeling: 'feeling hopeful' },
  { authorIdx: 2, content: "Sometimes the simplest compositions are the strongest. A single tree, golden light, no edits.", imgSeed: 111, feeling: 'feeling serene' },
  { authorIdx: 11, content: "Morning practice on the mesa. The red rocks make everything feel sacred. 🙏", imgSeed: 112, feeling: 'feeling grounded' },
  { authorIdx: 1, content: "Hot take: every team should have a designer in their standup. The disconnect between design and engineering is where products die.", imgSeed: 0, feeling: 'feeling opinionated' },
  { authorIdx: 4, content: "Reminder to every founder: your burn rate is not a badge of honor. Profitability is freedom.", imgSeed: 0, feeling: 'feeling determined' },
  { authorIdx: 5, content: "There is no love sincerer than the love of food. — George Bernard Shaw. Preaching to the choir here. ❤️", imgSeed: 113, feeling: 'feeling warm' },
]

const comments = [
  "This is amazing! Congrats 🎉",
  "So happy for you!",
  "Inspiring as always 🔥",
  "Need to catch up soon, let's grab coffee",
  "This made my day",
  "Beautiful work",
  "Tell us more about the process!",
  "Saving this for inspiration",
  "You're crushing it",
  "Wow, the colors 🤩",
  "Congrats on the funding!",
  "That gnocchi looks unreal 😍",
  "Where is this? Need to visit",
  "Agreed 100%",
  "Take my upvote",
  "This is why I follow you",
]

async function main() {
  console.log('Seeding database...')

  // Wipe
  await db.like.deleteMany()
  await db.comment.deleteMany()
  await db.post.deleteMany()
  await db.message.deleteMany()
  await db.notification.deleteMany()
  await db.story.deleteMany()
  await db.friendship.deleteMany()
  await db.user.deleteMany()

  // Users
  const createdUsers = []
  for (let i = 0; i < users.length; i++) {
    const u = users[i]
    const user = await db.user.create({
      data: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        name: `${u.firstName} ${u.lastName}`,
        avatarUrl: avatar(i + 1),
        coverUrl: cover(i + 1),
        bio: u.bio,
        work: u.work,
        education: u.education,
        location: u.location,
        online: i % 3 !== 0, // most online
      },
    })
    createdUsers.push(user)
  }
  const me = createdUsers[0]
  console.log(`Created ${createdUsers.length} users`)

  // Friendships: me (index 0) friends with everyone; plus a web among others
  for (let i = 1; i < createdUsers.length; i++) {
    await db.friendship.create({
      data: { userAId: me.id, userBId: createdUsers[i].id, status: 'ACCEPTED' },
    })
  }
  // extra friendships
  const extraPairs = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [1, 4], [3, 6], [2, 7]]
  for (const [a, b] of extraPairs) {
    await db.friendship.create({
      data: { userAId: createdUsers[a].id, userBId: createdUsers[b].id, status: 'ACCEPTED' },
    })
  }
  console.log('Created friendships')

  // Posts
  const createdPosts = []
  for (const p of posts) {
    const author = createdUsers[p.authorIdx]
    const post = await db.post.create({
      data: {
        authorId: author.id,
        content: p.content,
        imageUrl: p.imgSeed ? postImg(p.imgSeed) : null,
        feeling: p.feeling || null,
      },
    })
    createdPosts.push(post)
  }
  console.log(`Created ${createdPosts.length} posts`)

  // Likes — random distribution, me likes several
  const meLikes = [0, 2, 5, 8, 10, 12]
  for (const pi of meLikes) {
    await db.like.create({ data: { postId: createdPosts[pi].id, userId: me.id } })
  }
  for (const post of createdPosts) {
    const likerCount = 3 + Math.floor(Math.random() * 6)
    const pool = createdUsers.filter((u) => u.id !== post.authorId)
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, likerCount)
    for (const u of shuffled) {
      await db.like.create({ data: { postId: post.id, userId: u.id } }).catch(() => {})
    }
  }
  console.log('Created likes')

  // Comments
  for (const post of createdPosts) {
    const count = 2 + Math.floor(Math.random() * 4)
    const pool = createdUsers.filter((u) => u.id !== post.authorId)
    for (let i = 0; i < count; i++) {
      const u = pool[Math.floor(Math.random() * pool.length)]
      const text = comments[Math.floor(Math.random() * comments.length)]
      await db.comment.create({
        data: { postId: post.id, authorId: u.id, content: text },
      })
    }
  }
  // me comments on a couple
  await db.comment.create({ data: { postId: createdPosts[1].id, authorId: me.id, content: 'This is stunning, Sarah!' } })
  await db.comment.create({ data: { postId: createdPosts[5].id, authorId: me.id, content: 'Goals 😍' } })
  console.log('Created comments')

  // Stories — everyone (except me) has one; me has the "create" story placeholder handled in UI
  for (let i = 1; i < createdUsers.length; i++) {
    await db.story.create({
      data: {
        userId: createdUsers[i].id,
        imageUrl: storyImg(i + 20),
        caption: ['My morning ☀️', 'Out and about', 'Sunset vibes', 'On set today', 'Coffee run ☕', 'Weekend mode'][i % 6],
      },
    })
  }
  console.log('Created stories')

  // Messages — some chat history between me and Sarah, Mike, Emma
  const chatPartners = [createdUsers[1], createdUsers[2], createdUsers[3]]
  const convo = [
    [0, 'Hey! Are we still on for coffee tomorrow?'],
    [1, "Absolutely! 10am at the usual place?"],
    [0, 'Perfect, see you then ☕'],
    [1, 'Btw did you see the new design system update?'],
    [0, 'Yes! The tokens are so much cleaner now'],
    [1, 'Right?? Game changer'],
  ]
  const convo2 = [
    [0, 'Mike, your Brooklyn shots are insane 🔥'],
    [1, 'Thanks man! Golden hour is everything'],
    [0, 'When can we do a collab shoot?'],
    [1, "How about next weekend? I'll bring the lenses"],
  ]
  const convo3 = [
    [0, 'Emma! The campaign launch was incredible'],
    [1, 'Aww thank you! Means a lot coming from you'],
    [0, 'Seriously, the messaging was on point'],
    [1, "We should grab lunch and catch up 🥗"],
  ]
  const convos = [convo, convo2, convo3]
  for (let c = 0; c < chatPartners.length; c++) {
    const partner = chatPartners[c]
    const messages = convos[c]
    for (const [who, text] of messages) {
      await db.message.create({
        data: {
          senderId: who === 0 ? me.id : partner.id,
          receiverId: who === 0 ? partner.id : me.id,
          content: text,
        },
      })
    }
  }
  console.log('Created messages')

  // Notifications for me
  const notifs = [
    { from: 1, type: 'like', text: 'Sarah Chen and 24 others reacted to your post' },
    { from: 2, type: 'comment', text: 'Mike Johnson commented on your photo: "Beautiful!"' },
    { from: 3, type: 'friend', text: 'Emma Wilson sent you a friend request' },
    { from: 4, type: 'tag', text: 'David Kim tagged you in a post' },
    { from: 5, type: 'like', text: 'Lisa Brown and 6 others reacted to your comment' },
    { from: 6, type: 'comment', text: 'Tom Davis replied to your comment' },
    { from: 7, type: 'friend', text: 'Jenny Lee accepted your friend request' },
    { from: 8, type: 'like', text: 'Mark Garcia reacted to your post' },
  ]
  for (const n of notifs) {
    await db.notification.create({
      data: {
        userId: me.id,
        fromUserId: createdUsers[n.from].id,
        type: n.type,
        text: n.text,
        read: Math.random() > 0.6,
      },
    })
  }
  console.log('Created notifications')

  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
