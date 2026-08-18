"use client";

import { useState, type FormEvent } from "react";

type UserRole = "ADMIN" | "USER";
type UserStatus = "ACTIVE" | "DISABLED";

export type AdminUserRow = {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; username: string; name: string } | null;
};

export function UserManager({
  initialUsers,
  currentAdminId,
}: {
  initialUsers: AdminUserRow[];
  currentAdminId: string;
}) {
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [openPasswordRowId, setOpenPasswordRowId] = useState<string | null>(
    null,
  );

  return (
    <div className="admin-body">
      <CreateUserForm
        onCreated={(user) => setUsers((prev) => [user, ...prev])}
      />

      <section className="card">
        <h2>Users ({users.length})</h2>
        {users.length === 0 ? (
          <p className="muted">No users yet. Create the first one above.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created by</th>
                <th>Created</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isSelf={user.id === currentAdminId}
                  isPasswordFormOpen={openPasswordRowId === user.id}
                  onTogglePasswordForm={() =>
                    setOpenPasswordRowId((prev) =>
                      prev === user.id ? null : user.id,
                    )
                  }
                  onDeleted={() =>
                    setUsers((prev) => prev.filter((u) => u.id !== user.id))
                  }
                  onPasswordChanged={() => setOpenPasswordRowId(null)}
                />
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function CreateUserForm({
  onCreated,
}: {
  onCreated: (user: AdminUserRow) => void;
}) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, password, role }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to create user");
        return;
      }

      onCreated(data.user as AdminUserRow);
      setUsername("");
      setName("");
      setPassword("");
      setRole("USER");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card">
      <h2>Create a user</h2>
      <p className="muted">
        Set their initial username and password now and hand them off manually.
        There is no self-service sign-up or password reset yet.
      </p>
      <form className="form form-row" onSubmit={handleSubmit}>
        <label className="field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        <label className="field">
          <span>Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create user"}
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}
    </section>
  );
}

function UserRow({
  user,
  isSelf,
  isPasswordFormOpen,
  onTogglePasswordForm,
  onDeleted,
  onPasswordChanged,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  isPasswordFormOpen: boolean;
  onTogglePasswordForm: () => void;
  onDeleted: () => void;
  onPasswordChanged: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState<AdminUserRow>(user);

  async function handleToggleStatus() {
    const newStatus = localUser.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const action = newStatus === "DISABLED" ? "disable" : "enable";
    if (
      !window.confirm(
        `${newStatus === "DISABLED" ? "Disable" : "Enable"} user "${localUser.username}"?`,
      )
    ) {
      return;
    }
    setIsTogglingStatus(true);
    setRowError(null);
    try {
      const response = await fetch(`/api/admin/users/${localUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        setRowError(data.error ?? `Unable to ${action} user`);
        return;
      }
      setLocalUser(data.user as AdminUserRow);
    } catch {
      setRowError("Something went wrong. Please try again.");
    } finally {
      setIsTogglingStatus(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(`Delete user "${localUser.username}"? This cannot be undone.`)
    ) {
      return;
    }
    setIsDeleting(true);
    setRowError(null);
    try {
      const response = await fetch(`/api/admin/users/${localUser.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        setRowError(data.error ?? "Unable to delete user");
        return;
      }
      onDeleted();
    } catch {
      setRowError("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <tr>
        <td>{localUser.username}</td>
        <td>{localUser.name}</td>
        <td>{localUser.role}</td>
        <td>
          <span className={`badge badge-${localUser.status.toLowerCase()}`}>
            {localUser.status}
          </span>
        </td>
        <td>{localUser.createdBy ? localUser.createdBy.username : "—"}</td>
        <td>{new Date(localUser.createdAt).toLocaleDateString()}</td>
        <td className="actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onTogglePasswordForm}
          >
            {isPasswordFormOpen ? "Cancel" : "Change password"}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              localUser.status === "ACTIVE" ? "btn-danger" : "btn-success"
            }`}
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
          >
            {isTogglingStatus
              ? "Updating..."
              : localUser.status === "ACTIVE"
                ? "Disable"
                : "Enable"}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={isDeleting || isSelf}
            title={isSelf ? "You cannot delete your own account" : undefined}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </td>
      </tr>
      {isPasswordFormOpen && (
        <tr>
          <td colSpan={7}>
            <ChangePasswordForm userId={localUser.id} onDone={onPasswordChanged} />
          </td>
        </tr>
      )}
      {rowError && (
        <tr>
          <td colSpan={7}>
            <p className="form-error">{rowError}</p>
          </td>
        </tr>
      )}
    </>
  );
}

function ChangePasswordForm({
  userId,
  onDone,
}: {
  userId: string;
  onDone: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to change password");
        return;
      }
      setSuccess(true);
      setTimeout(onDone, 800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form form-row inline-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>New password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          autoFocus
        />
      </label>
      <button
        type="submit"
        className="btn btn-primary btn-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Set password"}
      </button>
      {success && <span className="form-success">Password updated.</span>}
      {error && <span className="form-error">{error}</span>}
    </form>
  );
}
