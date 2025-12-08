export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-xl font-bold text-primary">
              Admin Dashboard
            </h1>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
