import { createRootRoute, HeadContent, Link, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import appCss from '~/styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'A.I.M. Prompt Studio' },
      {
        name: 'description',
        content: 'Structured prompt builder for Actor / Input / Mission / K.I.S.S. / Reasoning / Format / Examples.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><text y=%2213%22 font-size=%2213%22>🎯</text></svg>' },
    ],
  }),
  shellComponent: RootShell,
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const NAV = [
  { to: '/', label: 'Studio' },
  { to: '/knowledge', label: 'Knowledge' },
  { to: '/library', label: 'Library' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' },
] as const

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-edge bg-panel/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-base font-semibold tracking-tight text-slate-100">
            A.I.M. <span className="text-accent">Prompt Studio</span>
          </Link>
          <nav className="flex gap-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-1.5 text-mist hover:text-slate-100"
                activeProps={{ className: 'rounded-md px-3 py-1.5 bg-edge text-slate-100' }}
                activeOptions={{ exact: item.to === '/' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-edge px-4 py-3 text-center text-xs text-slate-500">
        Actor · Input · Mission · K.I.S.S. · Reasoning · Format · Examples
      </footer>
    </div>
  )
}

function NotFound() {
  return (
    <div className="card space-y-2">
      <h2 className="text-sm font-semibold">Page not found</h2>
      <Link to="/" className="text-sm text-accent underline">
        Back to the Studio
      </Link>
    </div>
  )
}
