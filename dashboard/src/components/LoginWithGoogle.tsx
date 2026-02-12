import { supabase } from "@/lib/supabaseClient";

export function LoginWithGoogle() {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) console.error(error);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}
