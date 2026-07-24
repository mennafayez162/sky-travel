import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signUp = async ({ email, password, fullName }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) throw error;
  return data;
};

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return data;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

const authHeaders = () => ({
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${supabaseAnonKey}`,
});

export const uploadFile = async (bucket, file, path, opts = {}) => {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': opts.upsert ? 'true' : 'false',
    },
    body: file,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Upload failed');
  }
  return { path };
};

export const getFileUrl = (bucket, path) => {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
};

export const deleteFile = async (bucket, paths) => {
  for (const p of paths) {
    await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${p}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
  }
  return { paths };
};

export const supabaseQuery = async (table, options = {}) => {
  const { select = '*', filters = [], order, limit, offset } = options;

  let query = supabase.from(table).select(select);

  filters.forEach(({ column, operator, value }) => {
    switch (operator) {
      case 'eq':
        query = query.eq(column, value);
        break;
      case 'neq':
        query = query.neq(column, value);
        break;
      case 'gt':
        query = query.gt(column, value);
        break;
      case 'lt':
        query = query.lt(column, value);
        break;
      case 'like':
        query = query.like(column, value);
        break;
      case 'ilike':
        query = query.ilike(column, value);
        break;
      case 'in':
        query = query.in(column, value);
        break;
      default:
        query = query.eq(column, value);
    }
  });

  if (order) {
    query = query.order(order.column, { ascending: order.ascending ?? false });
  }

  if (limit) query = query.limit(limit);
  if (offset) query = query.range(offset, offset + (limit || 10) - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
};

export const supabaseInsert = async (table, record) => {
  const { data, error } = await supabase.from(table).insert(record).select();
  if (error) throw error;
  return data;
};

export const supabaseUpdate = async (table, id, updates) => {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data;
};

export const supabaseDelete = async (table, id) => {
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
};
