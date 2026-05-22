import AdminShell from '@/components/AdminShell'

export default function AdmLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
