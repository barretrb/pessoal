import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chbfnwrhnklwbylzjjrc.supabase.co';
const supabaseKey = 'sb_publishable_-sWWso02IkCSGZNOjypDIw_FivIt4h-';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('1. Testando inserção em feature_telemetry...');
  const { data: insertData, error: insertError } = await supabase.from('feature_telemetry').insert([
    {
      feature_name: 'test_connection',
      device_type: 'desktop',
      metadata: { source: 'automated_validation' }
    }
  ]).select();

  console.log('Insert result:', { insertData, insertError });

  console.log('2. Testando consulta em feature_telemetry...');
  const { data: selectData, error: selectError } = await supabase.from('feature_telemetry').select('*');
  console.log('Select result:', { count: selectData ? selectData.length : 0, selectError });
}

test().catch(console.error);
