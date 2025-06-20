import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BASE_URL}/auth`;

export interface SignInPayload {
  email: string;
  password: string;
}

export async function signIn(data: SignInPayload): Promise<void> {
  await axios.post(`${API_URL}/sign-in/email`, data, { withCredentials: true });
}
