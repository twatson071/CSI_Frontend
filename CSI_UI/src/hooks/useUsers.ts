import { useState, useEffect } from "react";
import * as UserService from "../services/UserService";

export function useUsers() {
  const [users, setUsers] = useState<UserService.User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await UserService.getUsers();
      setUsers(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (user: UserService.CreateUserPayload) => {
    setLoading(true);
    try {
      const newUser = await UserService.createUser(user);
      setUsers((prev) => [...prev, newUser]);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (
    id: number,
    updates: UserService.UpdateUserPayload
  ) => {
    setLoading(true);
    try {
      const updated = await UserService.updateUser(id, updates);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    setLoading(true);
    try {
      await UserService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}
