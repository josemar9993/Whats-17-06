require('dotenv').config();
const path = require('path');

const config = {
  commandPrefix: process.env.COMMAND_PREFIX || '!',
  adminIds: (process.env.ADMIN_WHATSAPP_IDS || process.env.WHATSAPP_ADMIN_NUMBER || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
  defaultSummaryDays: parseInt(process.env.DEFAULT_SUMMARY_DAYS, 10) || 7,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  emailTo: process.env.EMAIL_TO,
  dailySummaryCron: process.env.DAILY_SUMMARY_CRON || '0 16 * * *',
  dbPath: process.env.DB_PATH || path.resolve(__dirname, '../data/messages.db'),
};

module.exports = config;
