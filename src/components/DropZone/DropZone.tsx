import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  latestChanges?: string[];
  onOpenOnboarding?: () => void;
}

export function DropZone({ onFilesSelected, disabled = false, latestChanges = [], onOpenOnboarding }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const files = Array.from(event.dataTransfer.files).filter((file) => file.type === 'application/pdf');
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (disabled) {
      return;
    }

    const files = Array.from(event.target.files ?? []).filter((file) => file.type === 'application/pdf');
    if (files.length > 0) {
      onFilesSelected(files);
    }

    event.target.value = '';
  };

  return (
    <section className="hero-grid mx-auto max-w-6xl rounded-3xl border border-cyan-200/60 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-cyan-900/40 dark:bg-slate-950/65 md:p-10">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
        multiple
      />

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">Future-Proof PDF Workflow</p>
        <h2 className="neon-text text-4xl font-semibold text-slate-900 dark:text-white md:text-6xl">VViewer</h2>
        <p className="max-w-2xl text-sm text-slate-700 dark:text-slate-200 md:text-base">
          Rearrange, rotate, split, merge, and export PDFs fully in your browser. No account required. No telemetry. No ads.
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-200">
          <span className="rounded-full border border-cyan-300/70 px-3 py-1 dark:border-cyan-800">No Login</span>
          <span className="rounded-full border border-cyan-300/70 px-3 py-1 dark:border-cyan-800">No Data Upload</span>
          <span className="rounded-full border border-cyan-300/70 px-3 py-1 dark:border-cyan-800">Runs Offline-Capable</span>
        </div>
      </div>

      <div
        className={`mt-6 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/30'
            : 'border-slate-300 bg-white/85 dark:border-slate-700 dark:bg-slate-900/75'
        } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Drop PDF files or click to choose"
      >
        <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">Drop PDF files here</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">or click to open from your computer</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tip: Add additional PDFs later with "Add File" to merge.</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div className="rounded-2xl border border-slate-200 bg-white/75 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">Recent Updates</h3>
          <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {latestChanges.length > 0 ? (
              latestChanges.map((item) => <li key={item}>- {item}</li>)
            ) : (
              <li>- Improved rendering, onboarding, and workflow guidance.</li>
            )}
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="rounded-xl border border-cyan-300 bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-cyan-700 dark:border-cyan-800"
          >
            Quick Tour
          </button>
          <a
            href="https://ko-fi.com/veno89"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-amber-300 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white shadow hover:bg-amber-600 dark:border-amber-800"
            aria-label="Support VViewer on Ko-fi"
            title="Support VViewer on Ko-fi"
          >
            Donate
          </a>
        </div>
      </div>
    </section>
  );
}
