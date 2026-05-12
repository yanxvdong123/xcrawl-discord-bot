/**
 * XCrawl Discord Bot — Scrape web pages via Discord slash commands
 * 
 * Deploy: node bot.js
 * Dependencies: discord.js, need to: npm install discord.js
 */

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const https = require('https');

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const API_KEY = process.env.XCRAWL_API_KEY || '';
const API_URL = process.env.XCRAWL_API_URL || 'https://api.xcrawl.com/v1';

if (!DISCORD_TOKEN || !API_KEY) {
  console.error('Error: DISCORD_BOT_TOKEN and XCRAWL_API_KEY required');
  process.exit(1);
}

function scrape(url, format = 'markdown') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ url, format });
    const hostname = new URL(API_URL).hostname;
    const opts = {
      hostname, path: '/scrape', method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ success: false, error: 'Parse failed' }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const commands = [
  new SlashCommandBuilder()
    .setName('scrape')
    .setDescription('Scrape a web page using XCrawl proxy')
    .addStringOption(option =>
      option.setName('url').setDescription('URL to scrape').setRequired(true))
    .addStringOption(option =>
      option.setName('format').setDescription('Output format')
        .addChoices(
          { name: 'Markdown', value: 'markdown' },
          { name: 'JSON', value: 'json' },
          { name: 'Text', value: 'text' },
          { name: 'HTML', value: 'html' },
        )),
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Slash commands registered');
  } catch (err) {
    console.error('Register commands error:', err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'scrape') return;

  const url = interaction.options.getString('url', true);
  const format = interaction.options.getString('format') || 'markdown';

  await interaction.deferReply();
  
  try {
    const result = await scrape(url, format);
    if (result.success) {
      const content = result.content || JSON.stringify(result, null, 2);
      const maxLen = 1900;
      const truncated = content.length > maxLen ? content.substring(0, maxLen) + '\n... (truncated)' : content;
      await interaction.editReply(`✅ **${url}**\n\`\`\`\n${truncated}\n\`\`\``);
    } else {
      await interaction.editReply(`❌ Error: ${result.error || 'Unknown'}`);
    }
  } catch (err) {
    await interaction.editReply(`❌ Error: ${err.message}`);
  }
});

client.login(DISCORD_TOKEN);
