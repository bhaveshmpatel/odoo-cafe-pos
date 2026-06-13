import { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In - Odoo Cafe POS",
  description: "Sign in to access your dashboard",
};

export default function SignInPage() {
  return <SignInForm />;
}
