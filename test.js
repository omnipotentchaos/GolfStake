const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://pxnqemacouluepafjwyx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4bnFlbWFjb3VsdWVwYWZqd3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDQxNTMsImV4cCI6MjA4OTkyMDE1M30.hHSKFhFALVDYp2H7efJAo84ACrJLJMSqwNhJEISt4vU');

supabase.auth.signUp({ email: 'ashish@gmail.com', password: 'password123' })
  .then(res => {
    console.log("Signup Result:");
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error("Signup Error:");
    console.error(err);
    process.exit(1);
  });
