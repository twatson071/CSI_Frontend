import React, { useState } from "react";
import { useUsers } from "../../hooks/useUsers";
import PermissionGuard from "../common/PermissionGuard";
import * as UserService from "../../services/UserService";

const UserManagement = () => {
  const { users, loading, error, createUser, updateUser, deleteUser } =
    useUsers();
  const [editingUser, setEditingUser] = useState<UserService.User | null>(null);
  const [newUser, setNewUser] = useState<UserService.CreateUserPayload>({
    email: "",
    name: "",
    password: "",
    roleId: 3,
  });

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users.</div>;

  return (
    <div>
      <h2>User Management</h2>
      <PermissionGuard check={(p) => p.role === "admin"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createUser(newUser);
          }}
        >
          <input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <select
            value={newUser.roleId}
            onChange={(e) =>
              setNewUser({ ...newUser, roleId: Number(e.target.value) })
            }
          >
            <option value={1}>Admin</option>
            <option value={2}>System Maintainer</option>
            <option value={3}>Operator</option>
          </select>
          <button type="submit">Add User</button>
        </form>
      </PermissionGuard>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: UserService.User) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>
                {user.roleId === 1
                  ? "Admin"
                  : user.roleId === 2
                  ? "System Maintainer"
                  : "Operator"}
              </td>
              <td>
                <PermissionGuard check={(p) => p.role === "admin"}>
                  <button onClick={() => setEditingUser(user)}>Edit</button>
                  <button onClick={() => deleteUser(user.id)}>Delete</button>
                </PermissionGuard>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingUser && (
        <div>
          <h3>Edit User</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateUser(editingUser.id, editingUser);
              setEditingUser(null);
            }}
          >
            <input
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />
            <input
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
            />
            <select
              value={editingUser.roleId}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  roleId: Number(e.target.value),
                })
              }
            >
              <option value={1}>Admin</option>
              <option value={2}>System Maintainer</option>
              <option value={3}>Operator</option>
            </select>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditingUser(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
