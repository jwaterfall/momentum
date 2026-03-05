import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>{children}</SignedIn>
    </>
  );
}
