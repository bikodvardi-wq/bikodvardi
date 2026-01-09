import { createClient } from '@supabase/supabase-js';

// Bunları kendi Supabase dashboard'undan alıp tırnak içine yapıştır
const supabaseUrl = 'https://cwoswinjuiwcylcsufav.supabase.co';
const supabaseAnonKey = 'sb_publishable_cv4jKxBhBlEhZm37YyHV6w_8ky1GQo5';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);