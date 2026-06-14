import { TerminalClient } from "@/components/pos/TerminalClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TerminalPage() {
  const session = await auth();
  if (!session) redirect("/signin");

  // Fetch menu data server-side
  let data = null;
  const token = (session.user as any).token;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:4000';
    const res = await fetch(`${apiUrl}/api/pos/menu`, {
      cache: "no-store", // Ensure fresh data
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (res.ok) {
      data = await res.json();
    } else if (res.status === 401) {
      redirect("/signin");
    } else {
      const text = await res.text();
      console.error("Failed to fetch menu data, status:", res.status, "text:", text);
    }
  } catch (err) {
    console.error("Failed to fetch menu data (exception):", err);
  }

  if (!data || !data.success) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-canvas">
        <div className="bg-surface-card border border-error/20 p-6 rounded-xl shadow-sm text-center">
          <h2 className="text-error font-semibold mb-2">Failed to load POS Menu</h2>
          <p className="text-muted text-sm">Please ensure the backend API server is running.</p>
        </div>
      </div>
    );
  }

  return (
    <TerminalClient 
      categories={data.data.categories} 
      products={data.data.products} 
      promotions={data.data.promotions} 
      token={token}
      userRole={(session.user as any).role}
    />
  );
}
