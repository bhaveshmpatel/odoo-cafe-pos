import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { KdsClient } from "./KdsClient";

export default async function KdsPage() {
  const session = await auth();
  if (!session) redirect("/signin");

  const token = (session.user as any).token;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
  
  let initialOrders = [];
  try {
    const res = await fetch(`${apiUrl}/api/pos/active-orders`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        initialOrders = data.data;
      }
    } else if (res.status === 401) {
      redirect("/signin");
    }
  } catch (err) {
    console.error("Failed to fetch active orders:", err);
  }

  return <KdsClient initialOrders={initialOrders} />;
}
