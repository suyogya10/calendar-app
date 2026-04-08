// src/lib/api.ts
const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  
  const headers: Record<string, string> = {
    "Accept": "application/json",
    ...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Always check for errors FIRST
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || JSON.stringify(errorBody) || errorMessage;
    } catch {
      // ignore non-json error bodies
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;

  // Detect file/blob responses by Content-Type
  const contentType = response.headers.get("content-type") ?? "";
  if (
    contentType.includes("spreadsheetml") ||
    contentType.includes("vnd.ms-excel") ||
    contentType.includes("octet-stream") ||
    contentType.includes("text/csv")
  ) {
    return response.blob();
  }

  return response.json();
}

/**
 * Trigger a browser file download from a Blob.
 * Automatically appends the correct extension if filename has none.
 */
export function downloadBlob(blob: Blob, filename: string) {
  if (!filename.includes(".")) {
    if (blob.type.includes("spreadsheetml") || blob.type.includes("ms-excel")) filename += ".xlsx";
    else if (blob.type.includes("csv")) filename += ".csv";
    else filename += ".xlsx";
  }
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
