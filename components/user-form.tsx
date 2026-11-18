'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userSchema, type UserInput } from '@/lib/validation';

const emptyUser: UserInput = {
  name: '',
  email: '',
  role: 'member',
  salary: '',
  startDate: '',
};

export function UserForm({ user }: { user?: UserInput & { id: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<UserInput>(
    user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
          salary: user.salary,
          startDate: user.startDate,
        }
      : emptyUser,
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);

  const validation = userSchema.safeParse(values);
  const errors = validation.success
    ? {}
    : validation.error.flatten().fieldErrors;

  async function saveUser(event: React.FormEvent) {
    event.preventDefault();
    if (!validation.success) return;
    setSaving(true);
    setMessage('');
    try {
      const url = user ? `/api/users/${user.id}` : '/api/users';
      const response = await fetch(url, {
        method: user ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      setMessage(user ? 'User updated.' : 'User created.');
      setOpen(false);
      if (!user) setValues(emptyUser);
      setTouched({});
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Could not save user.',
      );
    } finally {
      setSaving(false);
    }
  }

  function openForm() {
    setMessage('');
    setOpen(true);
  }

  function updateField(field: keyof UserInput, value: string) {
    setValues({ ...values, [field]: value });
    setTouched({ ...touched, [field]: true });
  }

  return (
    <div>
      <button className={user ? 'text-button' : 'primary'} onClick={openForm}>
        {user ? 'Edit' : 'Add user'}
      </button>
      {!open && message && (
        <span role="status" className="feedback">
          {message}
        </span>
      )}
      {open && (
        <dialog
          ref={dialog}
          onCancel={() => setOpen(false)}
          aria-labelledby={`form-${user?.id ?? 'new'}`}
          className="modal"
        >
          <h2 id={`form-${user?.id ?? 'new'}`}>
            {user ? 'Edit user' : 'Add user'}
          </h2>
          <form onSubmit={saveUser}>
            <label>
              Name
              <input
                type="text"
                autoFocus
                disabled={saving}
                value={values.name}
                onChange={(event) => updateField('name', event.target.value)}
                aria-invalid={touched.name && !!errors.name}
                aria-describedby={
                  touched.name && errors.name
                    ? `${user?.id ?? 'new'}-name-error`
                    : undefined
                }
              />
              {touched.name && errors.name && (
                <span className="error" id={`${user?.id ?? 'new'}-name-error`}>
                  {errors.name[0]}
                </span>
              )}
            </label>
            <label>
              Email
              <input
                type="email"
                disabled={saving}
                value={values.email}
                onChange={(event) => updateField('email', event.target.value)}
                aria-invalid={touched.email && !!errors.email}
                aria-describedby={
                  touched.email && errors.email
                    ? `${user?.id ?? 'new'}-email-error`
                    : undefined
                }
              />
              {touched.email && errors.email && (
                <span className="error" id={`${user?.id ?? 'new'}-email-error`}>
                  {errors.email[0]}
                </span>
              )}
            </label>
            <label>
              Role
              <select
                disabled={saving}
                value={values.role}
                onChange={(event) => updateField('role', event.target.value)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              Salary
              <input
                type="text"
                inputMode="decimal"
                disabled={saving}
                value={values.salary}
                onChange={(event) => updateField('salary', event.target.value)}
                aria-invalid={touched.salary && !!errors.salary}
                aria-describedby={
                  touched.salary && errors.salary
                    ? `${user?.id ?? 'new'}-salary-error`
                    : undefined
                }
              />
              {touched.salary && errors.salary && (
                <span
                  className="error"
                  id={`${user?.id ?? 'new'}-salary-error`}
                >
                  {errors.salary[0]}
                </span>
              )}
            </label>
            <label>
              Start date
              <input
                type="date"
                disabled={saving}
                value={values.startDate}
                onChange={(event) =>
                  updateField('startDate', event.target.value)
                }
                aria-invalid={touched.startDate && !!errors.startDate}
                aria-describedby={
                  touched.startDate && errors.startDate
                    ? `${user?.id ?? 'new'}-startDate-error`
                    : undefined
                }
              />
              {touched.startDate && errors.startDate && (
                <span
                  className="error"
                  id={`${user?.id ?? 'new'}-startDate-error`}
                >
                  {errors.startDate[0]}
                </span>
              )}
            </label>
            {message && (
              <p role="alert" className="error">
                {message}
              </p>
            )}
            <div className="form-actions">
              <button
                type="button"
                disabled={saving}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="primary"
                disabled={saving || !validation.success}
              >
                {saving ? 'Saving…' : 'Save user'}
              </button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
}

export function DeleteUser({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function deleteUser() {
    if (!window.confirm(`Delete ${name}?`)) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).error);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete user.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        className="text-button danger"
        disabled={busy}
        onClick={deleteUser}
      >
        {busy ? 'Deleting…' : 'Delete'}
      </button>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
