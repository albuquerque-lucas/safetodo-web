import { useState } from 'react'
import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from './layout/Topbar'
import Sidebar from './layout/Sidebar'

type SidebarLayoutProps = {
  title: string
  children?: ReactNode
}

const SidebarLayout = ({ title, children }: SidebarLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isAdmin = localStorage.getItem('auth_role') === 'super_admin'

  return (
    <>
      <Topbar
        title={title}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
      />

      <div className={`app-layout ${isSidebarOpen ? 'is-open' : ''}`}>
        <Sidebar isOpen={isSidebarOpen} isAdmin={isAdmin} />
        <main className="main-content">{children ?? <Outlet />}</main>
      </div>
    </>
  )
}

export default SidebarLayout
