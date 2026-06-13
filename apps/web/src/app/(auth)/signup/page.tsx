import { Metadata } from "next";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up - Odoo Cafe POS",
  description: "Create an account for the POS system",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
