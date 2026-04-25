# Retro Dunman

## Summary

Let's build a PWA app - let's call it "Retro Dunman".

Summary:
Retro Dunman is a PWA app that keeps track of my owned physical games and consoles. 

For example, I own a console (Game Boy), and its physical game: Tetris).

The app lets me navigate between owned consoles and owned games (or by selecting console then related games).
The app lets me take a picture of a console / game(s) and then will proceed to identify it.
Upon identifying the console / game its attributes (name, brand, ...) are set and saved into a database.
The artwork for the console / game is retrieved online and used to populate the mentioned list of owned consoles / games.


## Stack

Frontend: React + Vite (PWA, deployable to Netlify/Vercel)
Identification: Claude Vision (claude-sonnet-4-6)
Metadata + Artwork: IGDB (Twitch) — best retro coverage, free tier
Backend/DB: Supabase (Postgres + Auth + file storage for photos)
Auth: Supabase magic link (email-based, no password to manage)
Styling: Tailwind CSS
