import { TopNav } from "@/components/layout/TopNav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      {children}
    </>
  );
}
