import { useCallback, useEffect, useEffectEvent, useState } from "react";

/** Fetch on input changes or refresh, ignoring completions from superseded requests. */
export function useDashboardRequest<T>(
  request: () => Promise<T>,
  onSuccess: (data: T) => void,
  options: { enabled?: boolean; onError?: (error: unknown) => void } = {},
) {
  const { enabled = true, onError } = options;
  const [revision, setRevision] = useState(0);
  const [completed, setCompleted] = useState<{
    request: typeof request;
    revision: number;
    error: string | null;
  } | null>(null);
  const accept = useEffectEvent(onSuccess);
  const reject = useEffectEvent((error: unknown) => onError?.(error));
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    request().then(
      (data) => {
        if (!active) return;
        accept(data);
        setCompleted({ request, revision, error: null });
      },
      (error: unknown) => {
        if (!active) return;
        reject(error);
        setCompleted({ request, revision, error: String(error) });
      },
    );
    return () => { active = false; };
  }, [enabled, request, revision]);

  const current = completed?.request === request && completed.revision === revision;
  return { loading: enabled && !current, error: current ? completed.error : null, refresh };
}
