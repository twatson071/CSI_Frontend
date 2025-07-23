import React, { useState, useMemo } from "react";
import {
  RuxButton,
  RuxInput,
  RuxCard,
  RuxIcon,
  RuxTable,
  RuxTableHeaderRow,
  RuxTableHeaderCell,
  RuxTableBody,
  RuxTableRow,
  RuxTableCell,
  RuxCheckbox,
  RuxPopUp,
  RuxMenu,
  RuxMenuItem,
  RuxDialog,
  RuxSegmentedButton,
} from "@astrouxds/react";
import { useUsers } from "../../hooks/useUsers";
import { User } from "../../services/UserService";
import EnhancedUserForm from "./EnhancedUserForm";
import PermissionGuard from "../common/PermissionGuard";
import "./EnhancedUserManagement.css";

type ViewMode = "list" | "create" | "edit" | "view";
type FilterRole = "all" | "1" | "2" | "3";
type SortField = "name" | "email" | "roleId" | "createdAt";
type SortDirection = "asc" | "desc";

export const EnhancedUserManagement: React.FC = () => {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const ROLES = [
    { value: 1, label: "Admin", color: "critical" },
    { value: 2, label: "System Maintainer", color: "serious" },
    { value: 3, label: "Operator", color: "normal" },
  ];

  const getRoleInfo = (roleId: number) => ROLES.find(r => r.value === roleId) || ROLES[2];

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole === "all" || user.roleId === Number(filterRole);
      
      return matchesSearch && matchesRole;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === "createdAt") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, filterRole, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectUser = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selectedUsers).map(userId => deleteUser(userId)));
      setSelectedUsers(new Set());
      setShowBulkActions(false);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete users:", error);
    }
  };

  const handleUserFormSubmit = async (userData: any) => {
    try {
      if (viewMode === "create") {
        await createUser(userData);
      } else if (viewMode === "edit" && selectedUser) {
        await updateUser(selectedUser.id, userData);
      }
      setViewMode("list");
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  if (loading) {
    return (
      <div className="user-management-loading">
        <RuxIcon icon="refresh" className="spinning" size="large" />
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management-error">
        <RuxIcon icon="error" size="large" />
        <p>Error loading users: {error}</p>
        <RuxButton onClick={() => window.location.reload()}>Retry</RuxButton>
      </div>
    );
  }

  if (viewMode !== "list") {
    return (
      <EnhancedUserForm
        user={selectedUser}
        onSubmit={handleUserFormSubmit}
        onCancel={() => {
          setViewMode("list");
          setSelectedUser(null);
        }}
        mode={viewMode as "create" | "edit" | "view"}
      />
    );
  }

  return (
    <div className="enhanced-user-management">
      <RuxCard className="user-management-card">
        <div className="user-management-header">
          <div className="header-info">
            <h2>User Management</h2>
            <p>{filteredUsers.length} of {users.length} users</p>
          </div>
          <div className="header-actions">
            <PermissionGuard check={(p) => p.role === "admin"}>
              <RuxButton
                icon="add"
                onClick={() => setViewMode("create")}
              >
                Add User
              </RuxButton>
            </PermissionGuard>
          </div>
        </div>

        <div className="user-management-filters">
          <div className="search-section">
            <RuxInput
              type="search"
              label="Search Users"
              value={searchQuery}
              onRuxinput={(e: any) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
            />
          </div>

          <div className="filter-section">
            <label className="filter-label">Filter by Role:</label>
            <div className="role-filters">
              <RuxSegmentedButton>
                {[
                  { value: "all", label: "All Roles" },
                  ...ROLES.map(role => ({ value: role.value.toString(), label: role.label }))
                ].map((option) => (
                  <rux-segmented-button-item
                    key={option.value}
                    selected={filterRole === option.value}
                    onClick={() => setFilterRole(option.value as FilterRole)}
                  >
                    {option.label}
                  </rux-segmented-button-item>
                ))}
              </RuxSegmentedButton>
            </div>
          </div>
        </div>

        {selectedUsers.size > 0 && (
          <div className="bulk-actions-bar">
            <div className="bulk-info">
              <span>{selectedUsers.size} user{selectedUsers.size > 1 ? "s" : ""} selected</span>
            </div>
            <div className="bulk-actions">
              <RuxButton
                secondary
                onClick={() => setSelectedUsers(new Set())}
              >
                Clear Selection
              </RuxButton>
              <PermissionGuard check={(p) => p.role === "admin"}>
                <RuxButton
                  secondary
                  onClick={() => setShowDeleteDialog(true)}
                  className="danger-button"
                >
                  Delete Selected
                </RuxButton>
              </PermissionGuard>
            </div>
          </div>
        )}

        <div className="user-table-container">
          <RuxTable>
            <RuxTableHeaderRow>
              <RuxTableHeaderCell>
                <RuxCheckbox
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  indeterminate={selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length}
                  onRuxchange={handleSelectAll}
                />
              </RuxTableHeaderCell>
              <RuxTableHeaderCell
                className={`sortable ${sortField === "name" ? "sorted" : ""}`}
                onClick={() => handleSort("name")}
              >
                Name
                {sortField === "name" && (
                  <RuxIcon icon={sortDirection === "asc" ? "arrow-upward" : "arrow-downward"} size="extra-small" />
                )}
              </RuxTableHeaderCell>
              <RuxTableHeaderCell
                className={`sortable ${sortField === "email" ? "sorted" : ""}`}
                onClick={() => handleSort("email")}
              >
                Email
                {sortField === "email" && (
                  <RuxIcon icon={sortDirection === "asc" ? "arrow-upward" : "arrow-downward"} size="extra-small" />
                )}
              </RuxTableHeaderCell>
              <RuxTableHeaderCell
                className={`sortable ${sortField === "roleId" ? "sorted" : ""}`}
                onClick={() => handleSort("roleId")}
              >
                Role
                {sortField === "roleId" && (
                  <RuxIcon icon={sortDirection === "asc" ? "arrow-upward" : "arrow-downward"} size="extra-small" />
                )}
              </RuxTableHeaderCell>
              <RuxTableHeaderCell>Status</RuxTableHeaderCell>
              <RuxTableHeaderCell
                className={`sortable ${sortField === "createdAt" ? "sorted" : ""}`}
                onClick={() => handleSort("createdAt")}
              >
                Created
                {sortField === "createdAt" && (
                  <RuxIcon icon={sortDirection === "asc" ? "arrow-upward" : "arrow-downward"} size="extra-small" />
                )}
              </RuxTableHeaderCell>
              <RuxTableHeaderCell>Actions</RuxTableHeaderCell>
            </RuxTableHeaderRow>
            <RuxTableBody>
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.roleId || 3);
                return (
                  <RuxTableRow key={user.id}>
                    <RuxTableCell>
                      <RuxCheckbox
                        checked={selectedUsers.has(user.id)}
                        onRuxchange={() => handleSelectUser(user.id)}
                      />
                    </RuxTableCell>
                    <RuxTableCell>
                      <div className="user-name-cell">
                        <div className="user-avatar">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <span className="user-name">{user.name || "—"}</span>
                          {user.emailVerified && (
                            <RuxIcon icon="verified" size="extra-small" className="verified-icon" />
                          )}
                        </div>
                      </div>
                    </RuxTableCell>
                    <RuxTableCell>
                      <span className="user-email">{user.email}</span>
                    </RuxTableCell>
                    <RuxTableCell>
                      <span className={`role-badge role-${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </RuxTableCell>
                    <RuxTableCell>
                      <div className="status-indicator">
                        <div className="status-dot status-active"></div>
                        <span>Active</span>
                      </div>
                    </RuxTableCell>
                    <RuxTableCell>
                      <span className="created-date">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </RuxTableCell>
                    <RuxTableCell>
                      <div className="table-actions">
                        <RuxPopUp closeOnSelect placement="bottom-end">
                          <RuxButton size="small" slot="trigger">
                            <RuxIcon icon="more-vert" size="extra-small" />
                          </RuxButton>
                          <RuxMenu>
                            <RuxMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setViewMode("view");
                              }}
                            >
                              View Details
                            </RuxMenuItem>
                            <PermissionGuard check={(p) => p.role === "admin"}>
                              <RuxMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setViewMode("edit");
                                }}
                              >
                                Edit User
                              </RuxMenuItem>
                              <RuxMenuItem
                                onClick={() => deleteUser(user.id)}
                                className="danger-menu-item"
                              >
                                Delete User
                              </RuxMenuItem>
                            </PermissionGuard>
                          </RuxMenu>
                        </RuxPopUp>
                      </div>
                    </RuxTableCell>
                  </RuxTableRow>
                );
              })}
            </RuxTableBody>
          </RuxTable>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <RuxIcon icon="person" size="large" />
              <h3>No users found</h3>
              <p>
                {searchQuery || filterRole !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first user"}
              </p>
            </div>
          )}
        </div>
      </RuxCard>

      {showDeleteDialog && (
        <RuxDialog
          open={showDeleteDialog}
          onRuxdialogclosed={() => setShowDeleteDialog(false)}
          header="Confirm Bulk Delete"
          confirmText="Delete Users"
          denyText="Cancel"
          onRuxdialogconfirmed={handleBulkDelete}
          clickToClose
        >
          <div className="bulk-delete-content">
            <p>Are you sure you want to delete {selectedUsers.size} user{selectedUsers.size > 1 ? "s" : ""}?</p>
            <p>This action cannot be undone.</p>
          </div>
        </RuxDialog>
      )}
    </div>
  );
};

export default EnhancedUserManagement;