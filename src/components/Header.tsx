import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'

interface Props {
  dark: boolean
  onToggleTheme: () => void
}

export default function Header({ dark, onToggleTheme }: Props) {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-semibold tracking-wide sm:text-base">Asgardeo Actions Playground</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Client-side request builder and response simulator</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Toggle theme"
          >
            <span className="sr-only">{dark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            {dark ? <SunIcon className="w-4 h-4" aria-hidden="true" /> : <MoonIcon className="w-4 h-4" aria-hidden="true" />}
          </button>
          <a
            href="https://github.com/Lashen1227/asgardeo-actions-playground"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 md:inline-flex"
            aria-label="Open GitHub repository"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.48 0-.24-.01-1.04-.01-1.89-2.48.53-3-1.08-3-1.08-.43-1.13-1.05-1.43-1.05-1.43-.86-.6.06-.59.06-.59.95.07 1.45.99 1.45.99.84 1.48 2.21 1.05 2.75.8.08-.62.33-1.05.6-1.29-2.17-.25-4.45-1.12-4.45-4.98 0-1.1.38-2.01 1.01-2.72-.1-.25-.44-1.28.1-2.66 0 0 .82-.27 2.7 1.04A9.2 9.2 0 0112 6.84c.83 0 1.68.11 2.47.31 1.88-1.31 2.7-1.04 2.7-1.04.54 1.38.2 2.41.1 2.66.63.71 1.01 1.62 1.01 2.72 0 3.87-2.29 4.73-4.47 4.98.35.31.66.91.66 1.83 0 1.32-.01 2.39-.01 2.72 0 .26.18.59.69.48A10.28 10.28 0 0022 12.25C22 6.58 17.52 2 12 2z" />
            </svg>
            <span className="text-sm font-medium">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  )
}
