import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { save, open } from '@tauri-apps/plugin-dialog'

function Settings({ onResetComplete }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const filePath = await save({
        title: 'Export What2Eat Data',
        defaultPath: `what2eat-backup-${new Date().toISOString().split('T')[0]}.tar.gz`,
        filters: [{ name: 'Archive', extensions: ['tar.gz', 'tgz'] }],
      })
      if (!filePath) {
        setLoading(false)
        return
      }
      const result = await invoke('export_data', { destPath: filePath })
      setStatus({ type: 'success', text: result })
    } catch (err) {
      setStatus({ type: 'error', text: typeof err === 'string' ? err : err?.message || 'Export failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const filePath = await open({
        title: 'Import What2Eat Data',
        filters: [{ name: 'Archive', extensions: ['tar.gz', 'tgz'] }],
        multiple: false,
      })
      if (!filePath) {
        setLoading(false)
        return
      }
      const result = await invoke('import_data', { sourcePath: filePath })

      // Parse imported file list from result
      const match = result.match(/Imported \d+ files: (.+)/)
      const importedFiles = match ? match[1].split(', ') : []

      setStatus({ type: 'success', text: result + '\nValidating data schema...' })

      // Run schema validation via Claude
      if (importedFiles.length > 0) {
        try {
          const validation = await invoke('validate_imported_data', { importedFiles })
          setStatus({ type: 'success', text: result + '\n' + validation })
        } catch (valErr) {
          setStatus({
            type: 'warning',
            text: result + '\nSchema validation failed — data imported but may need manual review: ' +
              (typeof valErr === 'string' ? valErr : valErr?.message || 'unknown error')
          })
        }
      } else {
        setStatus({ type: 'success', text: result })
      }
    } catch (err) {
      setStatus({ type: 'error', text: typeof err === 'string' ? err : err?.message || 'Import failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const result = await invoke('reset_data')
      setConfirmReset(false)
      // Redirect to setup
      onResetComplete?.()
    } catch (err) {
      setStatus({ type: 'error', text: typeof err === 'string' ? err : err?.message || 'Reset failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-[var(--color-text)] mb-6">Settings</h1>

      {/* Status message */}
      {status && (
        <div className={`mb-4 p-3 rounded-xl text-sm whitespace-pre-wrap ${
          status.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200/50'
            : status.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border border-amber-200/50'
              : 'bg-red-50 text-red-800 border border-red-200/50'
        }`}>
          {status.text}
        </div>
      )}

      {/* Data Management */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-[var(--color-text-light)] uppercase tracking-wide">
          Data Management
        </h2>

        <div className="bg-white rounded-xl p-4 border border-[var(--color-peach)]/30 shadow-sm space-y-4">
          {/* Export */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text)]">Export data</h3>
              <p className="text-xs text-[var(--color-text-light)] mt-0.5">
                Save your inventory, recipes, preferences, and reminders as a backup
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[var(--color-sage)] text-white text-sm
                         hover:bg-[var(--color-sage-dark)] disabled:opacity-40 transition-colors cursor-pointer"
            >
              Export
            </button>
          </div>

          <hr className="border-[var(--color-peach)]/20" />

          {/* Import */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text)]">Import data</h3>
              <p className="text-xs text-[var(--color-text-light)] mt-0.5">
                Restore from a backup file — only user data is imported, framework files stay unchanged
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white border border-[var(--color-peach)]/50 text-sm
                         text-[var(--color-text)] hover:bg-[var(--color-peach)]/20 disabled:opacity-40
                         transition-colors cursor-pointer"
            >
              Import
            </button>
          </div>

          <hr className="border-[var(--color-peach)]/20" />

          {/* Reset */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-danger)]">Reset all data</h3>
              <p className="text-xs text-[var(--color-text-light)] mt-0.5">
                Clear everything — inventory, recipes, preferences, reminders. Can't be undone.
              </p>
            </div>
            {confirmReset ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-2 rounded-xl bg-white border border-[var(--color-peach)]/50 text-xs
                             text-[var(--color-text-light)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-3 py-2 rounded-xl bg-red-500 text-white text-xs
                             hover:bg-red-600 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Yes, reset
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2 rounded-xl bg-white border border-red-200 text-sm
                           text-[var(--color-danger)] hover:bg-red-50 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white/50 rounded-xl p-4 border border-[var(--color-peach)]/20">
          <h3 className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide mb-2">
            What gets exported / imported
          </h3>
          <ul className="text-xs text-[var(--color-text-light)] space-y-1">
            <li>Inventory (what's in your kitchen)</li>
            <li>Saved recipes and meal history</li>
            <li>Preferences (dietary, cuisines, cooking setup)</li>
            <li>Reminders</li>
            <li>Personal overrides (CLAUDE.local.md)</li>
          </ul>
          <p className="text-xs text-[var(--color-text-light)] mt-2 italic">
            Framework files (SKILL.md, CLAUDE.md) are never exported or overwritten during import.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings
