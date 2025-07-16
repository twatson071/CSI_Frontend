import axios from "axios";

const API_URL = `${import.meta.env.VITE_BASE_URL}`;

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roleId: number;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">> & {
  password?: string;
};

export async function getUsers(): Promise<User[]> {
  const resp = await axios.get<User[]>(`${API_URL}/users`);
  return resp.data;
}

export async function createUser(data: CreateUserPayload): Promise<User> {
  const resp = await axios.post<User>(`${API_URL}/users`, data);
  return resp.data;
}

export async function updateUser(
  userId: number,
  data: UpdateUserPayload
): Promise<User> {
  const resp = await axios.put<User>(`${API_URL}/users/${userId}`, data);
  return resp.data;
}

export async function deleteUser(userId: number): Promise<void> {
  await axios.delete(`${API_URL}/users/${userId}`);
}
