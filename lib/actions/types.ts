/** Result returned by every public Server Action. Actions never throw to the client. */
export type ActionSuccess<T> = { ok: true; data: T };
export type ActionFailure = {
  ok: false;
  /** Field-level errors keyed by field name (React Hook Form shows these inline). */
  errors: Record<string, string[] | undefined>;
  /** Form-level message, e.g. rate limit or failed bot check. */
  message?: string;
};
export type ActionResult<T = null> = ActionSuccess<T> | ActionFailure;
