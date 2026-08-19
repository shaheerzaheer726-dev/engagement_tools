"use client";

import { useState, type FormEvent } from "react";

type UserRole = "ADMIN" | "USER";
type UserStatus = "ACTIVE" | "DISABLED";
type RowPanel = "edit" | "password";

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
  initialShowCreate = false,
}: {
  initialUsers: AdminUserRow[];
  currentAdminId: string;
  initialShowCreate?: boolean;
}) {
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [showCreate, setShowCreate] = useState(initialShowCreate);
  const [openRow, setOpenRow] = useState<{
    id: string;
    panel: RowPanel;
  } | null>(null);

  function toggleRowPanel(id: string, panel: RowPanel) {
    setOpenRow((current) =>
      current?.id === id && current.panel === panel ? null : { id, panel },
    );
  }

  return (
    <div className="users-manager">
      <div className="users-toolbar">
        <div>
          <h2>All users</h2>
          <p>
            {users.length} {users.length === 1 ? "account" : "accounts"} in this
            workspace
          </p>
        </div>
        <button
          type="button"
          className="users-add-button"
          onClick={() => setShowCreate((current) => !current)}
          aria-expanded={showCreate}
          aria-controls="create-user-panel"
        >
          <span aria-hidden="true">+</span>
          {showCreate ? "Close" : "Add user"}
        </button>
      </div>

      {showCreate && (
        <CreateUserForm
          onCancel={() => setShowCreate(false)}
          onCreated={(user) => {
            setUsers((current) => [user, ...current]);
            setShowCreate(false);
          }}
        />
      )}

      <section className="users-list-card" aria-label="Workspace users">
        {users.length === 0 ? (
          <div className="users-empty-state">
            <span aria-hidden="true">••</span>
            <h3>No users yet</h3>
            <p>Add the first account to this workspace.</p>
          </div>
        ) : (
          <div className="users-table-scroll">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="users-actions-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelf={user.id === currentAdminId}
                    openPanel={openRow?.id === user.id ? openRow.panel : null}
                    onTogglePanel={(panel) => toggleRowPanel(user.id, panel)}
                    onClosePanel={() => setOpenRow(null)}
                    onDeleted={() => {
                      setUsers((current) =>
                        current.filter((item) => item.id !== user.id),
                      );
                      setOpenRow(null);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function CreateUserForm({
  onCreated,
  onCancel,
}: {
  onCreated: (user: AdminUserRow) => void;
  onCancel: () => void;
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
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="users-form-card" id="create-user-panel">
      <div className="users-form-heading">
        <div>
          <h3>Add a new user</h3>
          <p>Create their account and assign initial access.</p>
        </div>
        <button
          type="button"
          className="users-close-button"
          onClick={onCancel}
          aria-label="Close add user form"
        >
          ×
        </button>
      </div>

      <form className="users-form" onSubmit={handleSubmit}>
        <label className="users-field">
          <span>Full name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Ayesha Khan"
            autoComplete="name"
            required
          />
        </label>
        <label className="users-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="e.g. ayesha"
            autoComplete="off"
            autoCapitalize="none"
            minLength={3}
            required
          />
        </label>
        <label className="users-field">
          <span>Temporary password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <label className="users-field">
          <span>Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </label>

        {error && (
          <p className="users-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="users-form-actions">
          <button
            type="button"
            className="users-secondary-button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="users-primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding user…" : "Add user"}
          </button>
        </div>
      </form>
    </section>
  );
}

function UserRow({
  user,
  isSelf,
  openPanel,
  onTogglePanel,
  onClosePanel,
  onDeleted,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  openPanel: RowPanel | null;
  onTogglePanel: (panel: RowPanel) => void;
  onClosePanel: () => void;
  onDeleted: () => void;
}) {
  const [localUser, setLocalUser] = useState(user);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  async function handleToggleStatus() {
    const newStatus = localUser.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const action = newStatus === "DISABLED" ? "disable" : "enable";

    if (
      !window.confirm(
        `${action === "disable" ? "Disable" : "Enable"} ${localUser.name}?`,
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
    if (!window.confirm(`Delete ${localUser.name}? This cannot be undone.`)) {
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
        <td>
          <div className="users-person">
            <span className="users-person-avatar" aria-hidden="true">
              {localUser.name.trim().charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="users-person-name">
                {localUser.name}
                {isSelf && <span>You</span>}
              </div>
              <small>@{localUser.username}</small>
            </div>
          </div>
        </td>
        <td>
          <span className="users-role">{formatRole(localUser.role)}</span>
        </td>
        <td>
          <span
            className={`users-status users-status-${localUser.status.toLowerCase()}`}
          >
            <span aria-hidden="true" />
            {formatStatus(localUser.status)}
          </span>
        </td>
        <td className="users-created">
          {new Date(localUser.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </td>
        <td>
          <div
            className="users-row-actions"
            aria-label={`Actions for ${localUser.name}`}
          >
            <button
              type="button"
              className="users-action-button"
              onClick={() => onTogglePanel("edit")}
            >
              {openPanel === "edit" ? "Cancel" : "Edit"}
            </button>
            <button
              type="button"
              className="users-action-button"
              onClick={() => onTogglePanel("password")}
            >
              {openPanel === "password" ? "Cancel" : "Password"}
            </button>
            <button
              type="button"
              className="users-action-button"
              onClick={handleToggleStatus}
              disabled={isTogglingStatus || isSelf}
              title={isSelf ? "You cannot disable your own account" : undefined}
            >
              {isTogglingStatus
                ? "Updating…"
                : localUser.status === "ACTIVE"
                  ? "Disable"
                  : "Enable"}
            </button>
            <button
              type="button"
              className="users-action-button users-action-danger"
              onClick={handleDelete}
              disabled={isDeleting || isSelf}
              title={isSelf ? "You cannot delete your own account" : undefined}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </td>
      </tr>

      {openPanel && (
        <tr className="users-detail-row">
          <td colSpan={5}>
            {openPanel === "edit" ? (
              <EditUserForm
                user={localUser}
                onCancel={onClosePanel}
                onUpdated={(updatedUser) => {
                  setLocalUser(updatedUser);
                  onClosePanel();
                }}
              />
            ) : (
              <ChangePasswordForm
                userId={localUser.id}
                onCancel={onClosePanel}
                onDone={onClosePanel}
              />
            )}
          </td>
        </tr>
      )}

      {rowError && (
        <tr className="users-error-row">
          <td colSpan={5}>
            <p role="alert">{rowError}</p>
          </td>
        </tr>
      )}
    </>
  );
}

function EditUserForm({
  user,
  onUpdated,
  onCancel,
}: {
  user: AdminUserRow;
  onUpdated: (user: AdminUserRow) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to update user");
        return;
      }

      onUpdated(data.user as AdminUserRow);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="users-inline-form" onSubmit={handleSubmit}>
      <div className="users-inline-copy">
        <strong>Edit user</strong>
        <span>The username and role remain unchanged.</span>
      </div>
      <label className="users-field">
        <span>Full name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoFocus
        />
      </label>
      <div className="users-inline-actions">
        <button
          type="button"
          className="users-secondary-button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="users-primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
      {error && <p className="users-form-error">{error}</p>}
    </form>
  );
}

function ChangePasswordForm({
  userId,
  onDone,
  onCancel,
}: {
  userId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setError(data.error ?? "Unable to update password");
        return;
      }

      onDone();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="users-inline-form" onSubmit={handleSubmit}>
      <div className="users-inline-copy">
        <strong>Update password</strong>
        <span>This will sign the user out of all active sessions.</span>
      </div>
      <label className="users-field">
        <span>New password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          minLength={6}
          required
          autoFocus
        />
      </label>
      <div className="users-inline-actions">
        <button
          type="button"
          className="users-secondary-button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="users-primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating…" : "Update password"}
        </button>
      </div>
      {error && <p className="users-form-error">{error}</p>}
    </form>
  );
}

function formatRole(role: UserRole) {
  return role === "ADMIN" ? "Administrator" : "User";
}

function formatStatus(status: UserStatus) {
  return status === "ACTIVE" ? "Active" : "Disabled";
}
