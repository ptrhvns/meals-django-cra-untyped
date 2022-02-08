import AuthnContext from "../contexts/AuthnContext";
import { useContext } from "react";

export default function useAuthn() {
  return useContext(AuthnContext);
}
