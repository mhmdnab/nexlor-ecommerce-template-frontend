import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/cn';
import { Button } from './Button';

/** Standard error state: message + retry. Use on any async surface that failed. */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn’t load this. Please try again.',
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-danger/30 bg-danger-subtle/40 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-danger-subtle text-danger">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
