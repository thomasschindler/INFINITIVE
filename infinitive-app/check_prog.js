require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if(!url || !key) { console.log('missing keys'); process.exit(1); }
const supabase = createClient(url, key);

async function checkProg() {
  const { data, error } = await supabase.from('user_progress').select('*');
  console.log('Error:', error);
  console.log('Data count:', data ? data.length : 0);
  if(data && data.length > 0) {
    console.log(data);
  }
}
checkProg();
