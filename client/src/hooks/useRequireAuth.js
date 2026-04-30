import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export const useRequireAuth = () => {
  const [session, setSession] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setSession(session);
      }
    });
  }, []);

  return { session, isChecking: session === undefined };
};
