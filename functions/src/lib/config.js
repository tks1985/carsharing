function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error('Missing required environment variable: ' + name);
  return v;
}

if (process.env.TZ !== 'Asia/Tokyo') {
  console.error('WARNING: TZ env var is "' + process.env.TZ + '", expected "Asia/Tokyo". Date parsing (今日/明日) will be wrong near midnight JST.');
}

const CONFIG = {
  LINE_CHANNEL_ACCESS_TOKEN: requireEnv('LINE_CHANNEL_ACCESS_TOKEN'),
  LINE_CHANNEL_SECRET: requireEnv('LINE_CHANNEL_SECRET'),
  API_ACCESS_TOKEN: requireEnv('API_ACCESS_TOKEN'),
  CALENDAR_RANGE_DAYS: Number(process.env.CALENDAR_RANGE_DAYS || 31),
  AFTERNOON_START_HOUR: Number(process.env.AFTERNOON_START_HOUR || 13)
};

module.exports = CONFIG;
