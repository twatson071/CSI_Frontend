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
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
} from "../../services";

const UserForm: React.FC<ManagementFormProps<User>> = ({ item, onSubmit, onCancel }) => {
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
    <form onSubmit={handleSave} className="user-form">
      <RuxInput label="Name" value={name} onRuxinput={(e: any) => setName(e.target.value)} />
      <RuxInput label="Email" value={email} onRuxinput={(e: any) => setEmail(e.target.value)} />
      <RuxInput label="Role ID" value={roleId} onRuxinput={(e: any) => setRoleId(e.target.value)} />
      <RuxInput label="Password" type="password" value={password} onRuxinput={(e: any) => setPassword(e.target.value)} />
      <div className="form-actions">
        <RuxButton type="button" secondary onClick={onCancel}>Cancel</RuxButton>
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
      <RuxTable>
        <RuxTableHeaderRow>
          <RuxTableHeaderCell>ID</RuxTableHeaderCell>
          <RuxTableHeaderCell>Name</RuxTableHeaderCell>
          <RuxTableHeaderCell>Email</RuxTableHeaderCell>
          <RuxTableHeaderCell>Role ID</RuxTableHeaderCell>
          <RuxTableHeaderCell>Actions</RuxTableHeaderCell>
        </RuxTableHeaderRow>
        <RuxTableBody>
          {items.map((user) => (
            <RuxTableRow key={user.id}>
              <RuxTableCell>{user.id}</RuxTableCell>
              <RuxTableCell>{user.name}</RuxTableCell>
              <RuxTableCell>{user.email}</RuxTableCell>
              <RuxTableCell>{user.roleId}</RuxTableCell>
              <RuxTableCell>
                <RuxButton size="small" onClick={() => onEdit(user)}>Edit</RuxButton>
                <RuxButton size="small" secondary onClick={() => onDelete(user)}>
                  Delete
                </RuxButton>
              </RuxTableCell>
            </RuxTableRow>
          ))}
        </RuxTableBody>
      </RuxTable>
    )}
  />
);

export default ManageUsers;
