import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: string;
  href?: string;
  onClick?: () => void;
}

export function EmptyState({ icon, title, description, action, href, onClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-display text-xl text-paper-100 mb-2">{title}</h3>
      <p className="text-sm text-paper-400 mb-6 max-w-md">{description}</p>
      {action && href && (
        <Link
          href={href}
          className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors"
        >
          {action}
        </Link>
      )}
      {action && onClick && (
        <button
          onClick={onClick}
          className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}
