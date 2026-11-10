const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiOptions = RequestInit;

export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const headers = new Headers(options.headers);

  if (
    options.body &&
    !headers.has("Content-Type") &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || `Request failed with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
