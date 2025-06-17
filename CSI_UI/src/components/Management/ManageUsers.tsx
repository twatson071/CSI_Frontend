import React, { useState } from "react";
import {
  RuxButton,
  RuxInput,
  RuxTable,
  RuxTableHeaderRow,
  RuxTableHeaderCell,
  RuxTableBody,
  RuxTableRow,
  RuxTableCell,
} from "@astrouxds/react";
import ManagementMain, { ManagementFormProps } from "./ManagementMain";
import StatusIndicator from "./StatusIndicator";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
} from "../../services";

const UserForm: React.FC<ManagementFormProps<User>> = ({
  item,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(item?.name || "");
  const [email, setEmail] = useState(item?.email || "");
  const [roleId, setRoleId] = useState(item?.roleId ? String(item.roleId) : "");
  const [password, setPassword] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { name, email, roleId: parseInt(roleId, 10) };
    if (!item) payload.password = password;
    else if (password) payload.password = password;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSave} className="user-form management-form">
      <RuxInput
        label="Name"
        value={name}
        onRuxinput={(e: any) => setName(e.target.value)}
      />
      <RuxInput
        label="Email"
        value={email}
        onRuxinput={(e: any) => setEmail(e.target.value)}
      />
      <RuxInput
        label="Role ID"
        value={roleId}
        onRuxinput={(e: any) => setRoleId(e.target.value)}
      />
      <RuxInput
        label="Password"
        type="password"
        value={password}
        onRuxinput={(e: any) => setPassword(e.target.value)}
      />
      <div className="form-actions">
        <RuxButton type="button" secondary onClick={onCancel}>
          Cancel
        </RuxButton>
        <RuxButton type="submit">Save</RuxButton>
      </div>
    </form>
  );
};

const ManageUsers = () => (
  <ManagementMain<User>
    entityName="User"
    fetchItems={getUsers}
    createItem={createUser}
    updateItem={updateUser}
    deleteItem={deleteUser}
    getId={(u) => u.id}
    FormComponent={UserForm}
    renderList={(items, onEdit, onDelete) => (
      <div className="table-wrapper">
        <RuxTable>
          <RuxTableHeaderRow>
            <RuxTableHeaderCell>ID</RuxTableHeaderCell>
            <RuxTableHeaderCell>Name</RuxTableHeaderCell>
            <RuxTableHeaderCell>Email</RuxTableHeaderCell>
            <RuxTableHeaderCell>Role ID</RuxTableHeaderCell>
            <RuxTableHeaderCell>Status</RuxTableHeaderCell>
            <RuxTableHeaderCell>Actions</RuxTableHeaderCell>
          </RuxTableHeaderRow>
          <RuxTableBody>
            {items.map((user) => (
              <RuxTableRow key={user.id}>
                <RuxTableCell>{user.id}</RuxTableCell>
                <RuxTableCell>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--spacing-2)",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: "var(--color-status-normal)",
                        borderRadius: "50%",
                      }}
                    />
                    {user.name}
                  </div>
                </RuxTableCell>
                <RuxTableCell>{user.email}</RuxTableCell>
                <RuxTableCell>
                  <div className="entity-badge">Role {user.roleId}</div>
                </RuxTableCell>
                <RuxTableCell>
                  <div className="status-cell">
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "var(--color-status-normal)20",
                        border: "1px solid var(--color-status-normal)",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        color: "var(--color-status-normal)",
                        textTransform: "uppercase",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "var(--color-status-normal)",
                          borderRadius: "50%",
                        }}
                      />
                      active
                    </div>
                  </div>
                </RuxTableCell>
                <RuxTableCell>
                  <div className="table-actions">
                    <RuxButton size="small" onClick={() => onEdit(user)}>
                      Edit
                    </RuxButton>
                    <RuxButton
                      size="small"
                      secondary
                      onClick={() => onDelete(user)}
                    >
                      Delete
                    </RuxButton>
                  </div>
                </RuxTableCell>
              </RuxTableRow>
            ))}
          </RuxTableBody>
        </RuxTable>
      </div>
    )}
  />
);

export default ManageUsers;
