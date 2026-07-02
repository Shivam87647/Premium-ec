const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://unmwhluwmstjhrcpzxij.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubXdobHV3bXN0amhyY3B6eGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzQyNDQsImV4cCI6MjA5ODIxMDI0NH0.aOBo-SqeE_SQBQ54qJ2fn7344v4aZV061kzkDPRLmYA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('LATEST ORDERS:', data);
  console.log('ERROR:', error);
}

checkOrders();
