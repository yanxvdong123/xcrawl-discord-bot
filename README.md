# XCrawl Discord Scraper Bot

Discord bot that scrapes web pages using XCrawl Proxy.

## Commands

| Command | Description |
|---------|-------------|
| `/scrape <url>` | Scrape a web page (default: markdown) |
| `/scrape <url> format:json` | Scrape as JSON |
| `/help` | Show usage |

## Setup

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to Bot → Add Bot
4. Copy the token
5. Invite bot to server with `applications.commands` and `bot` scopes

## Run

```bash
DISCORD_BOT_TOKEN=your_token XCRAWL_API_KEY=your_key node index.js
```

## Deploy to Railway

1. Push to GitHub
2. Create Railway project from repo
3. Add env vars: `DISCORD_BOT_TOKEN`, `XCRAWL_API_KEY`
4. Deploy

## Monetization

- **Free tier**: 10 scrapes/day per server
- **Premium ($4.99/mo)**: Unlimited, batch scraping, priority queue
