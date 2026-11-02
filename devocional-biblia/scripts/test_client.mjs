import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chbfnwrhnklwbylzjjrc.supabase.co';
const supabaseKey = 'sb_publishable_-sWWso02IkCSGZNOjypDIw_FivIt4h-';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data, error } = await supabase.from('test_table').select('*');
  console.log('Query result:', { data, error });
}

testQuery().catch(console.error);
