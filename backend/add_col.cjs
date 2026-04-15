const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hwvjehitbbpcxujsyycc:xwk.RQ5..rF9fN7@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    
    await client.query('ALTER TABLE "UserChatbotSettings" ADD COLUMN IF NOT EXISTS "customPersonality" TEXT DEFAULT NULL;');
    console.log('Successfully added customPersonality column!');
    
    await client.query('NOTIFY pgrst, \'reload schema\';');
    console.log('Reloaded PostgREST schema cache!');
    
  } catch (err) {
    console.error('Error applying SQL:', err);
  } finally {
    await client.end();
  }
}

run();
