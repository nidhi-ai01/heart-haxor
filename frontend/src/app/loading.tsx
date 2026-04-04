export default function Loading() {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center p-4">
      <div className="app-content app-panel-strong flex w-full max-w-sm flex-col items-center gap-4 rounded-[2rem] px-8 py-10 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Loading</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Applying the new interface.
          </p>
        </div>
      </div>
    </div>
  );
}
