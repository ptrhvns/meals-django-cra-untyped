import { forOwn, head } from "lodash";

export function buildTitle(subtitle = null) {
  return subtitle ? `${subtitle} - Meals` : "Meals";
}

export function handleResponseErrors({
  response,
  setAlertMessage,
  setError,
} = {}) {
  if (setAlertMessage) {
    setAlertMessage(response.message);
  }

  if (setError) {
    forOwn(response.errors, (value, key) => {
      setError(key, { message: head(value), type: "manual" });
    });
  }
}
