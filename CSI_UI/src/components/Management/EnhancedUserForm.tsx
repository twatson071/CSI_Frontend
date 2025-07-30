import React, { useState, useEffect } from "react";
import {
  RuxButton,
  RuxInput,
  RuxCard,
  RuxIcon,
  RuxCheckbox,
  RuxDialog,
} from "@astrouxds/react";
import { User, CreateUserPayload, UpdateUserPayload } from "../../services/UserService";
import "./EnhancedUserForm.css";

interface EnhancedUserFormProps {
  user?: User | null;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
  onCancel: () => void;
  mode: "create" | "edit" | "view";
}

const ROLES = [
  { value: 1, label: "Admin", description: "Full system access and user management" },
  { value: 2, label: "System Maintainer", description: "Device and site management" },
  { value: 3, label: "Operator", description: "View-only access with limited actions" },
];

export const EnhancedUserForm: React.FC<EnhancedUserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState({
    email: user?.email || "",
    name: user?.name || "",
    password: "",
    confirmPassword: "",
    roleId: user?.roleId || 3,
    emailVerified: user?.emailVerified || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.name || "",
        password: "",
        confirmPassword: "",
        roleId: user.roleId || 3,
        emailVerified: user.emailVerified || false,
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!formData.email.endsWith(".mil")) {
      newErrors.email = "Email must end with .mil";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Password validation (only for new users or if password is being changed)
    if (mode === "create" || formData.password) {
      if (!formData.password && mode === "create") {
        newErrors.password = "Password is required";
      } else if (formData.password && formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (formData.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Password must contain uppercase, lowercase, and numbers";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        email: formData.email,
        name: formData.name,
        roleId: formData.roleId,
      };

      if (mode === "create" || formData.password) {
        payload.password = formData.password;
      }

      if (mode === "edit") {
        payload.emailVerified = formData.emailVerified;
      }

      await onSubmit(payload);
    } catch (error) {
      console.error("Failed to submit user form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (roleId: number) => {
    switch (roleId) {
      case 1: return "critical";
      case 2: return "serious";
      case 3: return "normal";
      default: return "off";
    }
  };

  if (mode === "view") {
    return (
      <RuxCard className="enhanced-user-form-card">
        <div className="user-form-header">
          <h3>User Details</h3>
          <RuxButton size="small" onClick={onCancel}>
            Close
          </RuxButton>
        </div>
        <div className="user-details-view">
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user?.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{user?.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Role:</span>
            <span className={`role-badge role-${getRoleBadgeColor(user?.roleId || 3)}`}>
              {ROLES.find(r => r.value === user?.roleId)?.label}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email Verified:</span>
            <span className="detail-value">
              {user?.emailVerified ? (
                <RuxIcon icon="check-circle" size="extra-small" />
              ) : (
                <RuxIcon icon="close" size="extra-small" />
              )}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Created:</span>
            <span className="detail-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
            </span>
          </div>
        </div>
      </RuxCard>
    );
  }

  return (
    <>
      <RuxCard className="enhanced-user-form-card">
        <form onSubmit={handleSubmit} className="enhanced-user-form">
          <div className="user-form-header">
            <h3>{mode === "create" ? "Create New User" : "Edit User"}</h3>
          </div>

          <div className="form-section">
            <RuxInput
              label="Email Address"
              type="email"
              value={formData.email}
              onRuxinput={(e: any) => setFormData({ ...formData, email: e.target.value })}
              errorText={errors.email}
              disabled={mode === "edit"}
              helpText={mode === "edit" ? "Email cannot be changed" : "Must be a .mil email address"}
              required
            />

            <RuxInput
              label="Full Name"
              value={formData.name}
              onRuxinput={(e: any) => setFormData({ ...formData, name: e.target.value })}
              errorText={errors.name}
              required
            />
          </div>

          <div className="form-section">
            <h4>Role Assignment</h4>
            <div className="role-selector">
              {ROLES.map((role) => (
                <label key={role.value} className={`role-option ${formData.roleId === role.value ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.roleId === role.value}
                    onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                  />
                  <div className="role-content">
                    <div className="role-header">
                      <RuxIcon icon={role.value === 1 ? "shield" : role.value === 2 ? "settings" : "person"} />
                      <span className="role-label">{role.label}</span>
                    </div>
                    <p className="role-description">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h4>{mode === "create" ? "Set Password" : "Change Password (Optional)"}</h4>
            <div className="password-inputs">
              <RuxInput
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onRuxinput={(e: any) => setFormData({ ...formData, password: e.target.value })}
                errorText={errors.password}
                helpText="At least 8 characters with uppercase, lowercase, and numbers"
                required={mode === "create"}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <RuxIcon icon={showPassword ? "visibility-off" : "visibility"} />
              </button>
            </div>

            <RuxInput
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onRuxinput={(e: any) => setFormData({ ...formData, confirmPassword: e.target.value })}
              errorText={errors.confirmPassword}
              required={mode === "create" || !!formData.password}
            />
          </div>

          {mode === "edit" && (
            <div className="form-section">
              <RuxCheckbox
                checked={formData.emailVerified}
                onRuxchange={(e: any) => setFormData({ ...formData, emailVerified: e.target.checked })}
              >
                Email Verified
              </RuxCheckbox>
            </div>
          )}

          <div className="form-actions">
            <RuxButton
              type="button"
              secondary
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </RuxButton>
            {mode === "edit" && (
              <RuxButton
                type="button"
                secondary
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting}
                className="delete-button"
              >
                Delete User
              </RuxButton>
            )}
            <RuxButton
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : mode === "create" ? "Create User" : "Save Changes"}
            </RuxButton>
          </div>
        </form>
      </RuxCard>

      {showDeleteConfirm && (
        <RuxDialog
          open={showDeleteConfirm}
          onRuxdialogclosed={() => setShowDeleteConfirm(false)}
          header="Confirm Delete"
          confirmText="Delete"
          denyText="Cancel"
          clickToClose
        >
          <div className="delete-confirm-content">
            <p>Are you sure you want to delete this user?</p>
            <p><strong>{user?.name} ({user?.email})</strong></p>
            <p>This action cannot be undone.</p>
          </div>
        </RuxDialog>
      )}
    </>
  );
};

export default EnhancedUserForm;