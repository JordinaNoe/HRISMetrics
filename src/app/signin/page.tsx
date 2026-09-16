import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { devLoginAllowed } from "@/auth.config";
import { colors, fontFamily } from "@/lib/theme";

async function signInAndHandleErrors(provider: string, options: Record<string, unknown>, callbackUrl: string) {
  try {
    await signIn(provider, options);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}&error=${error.type}`);
    }
    throw error;
  }
}

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.pageBg,
        fontFamily,
        color: colors.textPrimary,
      }}
    >
      <div style={{ background: colors.white, border: `1px solid ${colors.borderLight}`, borderRadius: 10, padding: "40px 36px", width: 360, textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em", marginBottom: 4 }}>HRIS Metrics Hub</div>
        <div style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 700, marginBottom: 28 }}>Sign in to continue</div>

        {params.error && <div style={{ fontSize: 13, color: colors.negative, marginBottom: 16 }}>Sign-in failed. Use your company account.</div>}

        <form
          action={async () => {
            "use server";
            await signInAndHandleErrors("microsoft-entra-id", { redirectTo: callbackUrl }, callbackUrl);
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "11px 22px",
              borderRadius: 4,
              border: "none",
              background: colors.action,
              color: "#fff",
              fontFamily,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Sign in with Microsoft
          </button>
        </form>

        {devLoginAllowed && (
          <form
            action={async (formData: FormData) => {
              "use server";
              await signInAndHandleErrors("dev-login", { email: formData.get("email"), redirectTo: callbackUrl }, callbackUrl);
            }}
            style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${colors.borderLight}`, textAlign: "left" }}
          >
            <div style={{ fontSize: 11, color: colors.textTertiary, marginBottom: 8 }}>Dev login (local only)</div>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              style={{ width: "100%", padding: "8px 10px", border: `1px solid ${colors.borderInput}`, borderRadius: 4, fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}
            />
            <button
              type="submit"
              style={{ width: "100%", padding: "8px 10px", borderRadius: 4, border: `1px solid ${colors.borderLight}`, background: colors.white, color: colors.textBody, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              Continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
