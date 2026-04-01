

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">CampusFlow</h1>
            <p className="mt-1 text-sm text-slate-300">
              Tailwind CSS is now wired up.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
            Ready
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 active:bg-slate-200">
            Primary action
          </button>
          <button className="rounded-xl border border-slate-700 bg-transparent px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800/60 active:bg-slate-800">
            Secondary action
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
