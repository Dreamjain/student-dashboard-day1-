export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (error?.response) {
    const { status, data, headers } = error.response;
    const serverMessage = typeof data?.message === "string" ? data.message.trim() : "";

    if (serverMessage) {
      if (status === 429) {
        const retryAfter = Number(headers?.["retry-after"]);
        if (Number.isFinite(retryAfter) && retryAfter > 0) {
          return `${serverMessage} Please wait ${retryAfter} seconds and try again.`;
        }
      }
      return serverMessage;
    }

    if (status === 401) return "Your session has expired. Please sign in again.";
    if (status === 403) return "You do not have permission to perform this action.";
    if (status === 404) return "The requested resource was not found.";
    if (status === 408) return "The request timed out. Please try again.";
    if (status >= 500) return "The server is unavailable right now. Please try again.";
  }

  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return "The request timed out. Please check your connection and try again.";
  }

  if (error?.request && !error?.response) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  return fallback;
}
