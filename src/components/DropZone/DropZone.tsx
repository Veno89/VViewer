import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesSelected, disabled = false }: DropZoneProps) {
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
    <div
      className={`mx-auto flex h-[70vh] max-w-3xl cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
      } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Drop PDF files or click to choose"
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
        multiple
      />
      <div className="space-y-3 text-center">
        <p className="text-xl font-semibold text-gray-900">Drop PDF files here</p>
        <p className="text-sm text-gray-600">or click to open from your computer</p>
      </div>
    </div>
  );
}
