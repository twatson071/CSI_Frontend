import axios from "axios";

export const apiRequest = async <T>(
  method: "GET" | "POST",
  url: string,
  data?: Record<string, any>
): Promise<T> => {
  try {
    const resp = await axios({
      method,
      url,
      data,
    });
    return resp.data;
  } catch (err) {
    console.error(`API request failed: ${method} ${url}`, err);
    throw err; // Let the caller handle the error
  }
};
