'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userSchema, type UserInput } from '@/lib/validation';
const empty: UserInput = { name: '', email: '', role: 'member', salary: '', startDate: '' };
export function UserForm({ user }: { user?: UserInput & { id: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) dialog.current?.showModal(); }, [open]);
  const [values, setValues] = useState<UserInput>(user ? { name: user.name, email: user.email, role: user.role, salary: user.salary, startDate: user.startDate } : empty);
  const [touched, setTouched] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const validation = userSchema.safeParse(values);
  const errors = validation.success ? {} : validation.error.flatten().fieldErrors;
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setTouched(Object.keys(values));
    if (!validation.success) return;
    setSaving(true); setMessage('');
    try {
      const response = await fetch(user ? `/api/users/${user.id}` : '/api/users', { method: user ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(validation.data) });
      if (!response.ok) throw new Error((await response.json()).error);
      setMessage(user ? 'User updated.' : 'User created.');
      setOpen(false); if (!user) setValues(empty); setTouched([]); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save user.'); }
    finally { setSaving(false); }
  }
  return <div className="form-control">
    <button className={user ? 'text-button' : 'primary'} onClick={() => { setOpen(true); setMessage(''); }}>{user ? 'Edit' : 'Add user'}</button>
    {!open && message && <span role="status" className="feedback">{message}</span>}
    {open && <dialog ref={dialog} onCancel={() => setOpen(false)} aria-labelledby={`form-${user?.id ?? 'new'}`} className="modal">
      <h2 id={`form-${user?.id ?? 'new'}`}>{user ? 'Edit user' : 'Add user'}</h2>
      <form onSubmit={submit}>
        {(['name', 'email', 'role', 'salary', 'startDate'] as const).map(key => <label key={key}>
          {{ name: 'Name', email: 'Email', role: 'Role', salary: 'Salary', startDate: 'Start date' }[key]}
          {key === 'role' ? <select disabled={saving} value={values.role} onChange={e => setValues({ ...values, role: e.target.value as UserInput['role'] })}><option value="member">Member</option><option value="admin">Admin</option></select> : <input autoFocus={key === 'name'} disabled={saving} type={key === 'startDate' ? 'date' : key === 'email' ? 'email' : 'text'} inputMode={key === 'salary' ? 'decimal' : undefined} value={values[key]} aria-invalid={touched.includes(key) && !!errors[key]} aria-describedby={touched.includes(key) && errors[key] ? `${user?.id ?? 'new'}-${key}-error` : undefined} onChange={e => { setValues({ ...values, [key]: e.target.value }); setTouched([...touched, key]); }} />}
          {touched.includes(key) && errors[key] && <span className="error" id={`${user?.id ?? 'new'}-${key}-error`}>{errors[key]?.[0]}</span>}
        </label>)}
        {message && <p role="alert" className="error">{message}</p>}
        <div className="form-actions"><button type="button" disabled={saving} onClick={() => setOpen(false)}>Cancel</button><button className="primary" disabled={saving || !validation.success}>{saving ? 'Saving…' : 'Save user'}</button></div>
      </form>
    </dialog>}
  </div>;
}
export function DeleteUser({ id, name }: { id: string; name: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  return <div><button className="text-button danger" disabled={busy} onClick={async () => {
    if (!window.confirm(`Delete ${name}?`)) return;
    setBusy(true); setError('');
    try { const response = await fetch(`/api/users/${id}`, { method: 'DELETE' }); if (!response.ok) throw new Error((await response.json()).error); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not delete user.'); }
    finally { setBusy(false); }
  }}>{busy ? 'Deleting…' : 'Delete'}</button>{error && <p role="alert" className="error">{error}</p>}</div>;
}
