# Banana Math :)

Checkout the site here: https://www.numerify.me/

We're creating a user-friendly website for mental math practice that's all about simplicity and speed. Our mission? To make math practice effortless and enjoyable. We're carefully building our tech stack, prioritizing quality over quantity at every step.With a strong focus on user experience and an agile approach, we're excited to bring you a top-notch math practice platform. Ready to dive in and crunch some numbers with us?

Stage 1: Basic Web app with calculation generated client-side

Stage 2: Create the backend with API for sending questions and getting results

Stage 3: Implement the database fully and have a functional site with a working leaderboard but no login

Stage 4: Authentication with Supabase for user, customization, leaderboard for user, user stats tracking

Stage 5: Ads and Subscription for upkeep cost, launch site!

## Run locally

Have a look at the .env.sample file and follow the steps in the link to create a .env.local

Local compiling

```
brew install npm
npm install next
npm run dev
```

Local compiling using docker

```
docker build . -t banana-math
docker run -d -p 3000:3000 banana-math
```
