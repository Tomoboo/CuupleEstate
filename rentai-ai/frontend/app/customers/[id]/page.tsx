import CustomerDetail from "./CustomerDetail";

// Next.js 16: params は Promise なので await して取り出す
export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerDetail id={id} />;
}
