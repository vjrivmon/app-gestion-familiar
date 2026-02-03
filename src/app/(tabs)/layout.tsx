import { BottomNav } from '@/components/layout/bottom-nav'

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {children}
      </main>
      <BottomNav />
    </>
  )
}
