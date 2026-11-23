import { Fragment } from "react";
import { site } from "@/lib/content/site";

export function SignalBand() {
  return (
    <section className="signal-band" id="signal">
      <p>Built for ambitious people inside</p>
      <div className="signal-logos" aria-label="Roles our learners work in">
        {site.signalRoles.map((role, i) => (
          <Fragment key={role}>
            {i > 0 && <i aria-hidden="true" />}
            <span>{role}</span>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
