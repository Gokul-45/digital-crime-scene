import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#060915' }}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0 relative">
        <Navbar toggleSidebar={() => setSidebarOpen(true)} />

        {/* Subtle background texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 50%, rgba(0,255,136,0.02) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(0,170,255,0.02) 0%, transparent 50%)
            `,
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-5 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
