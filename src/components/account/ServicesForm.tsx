"use client";

import { useActionState, useState } from "react";
import type { SubscriptionFormState } from "@/lib/accounts/subscriptionActions";
import { PRIMARY_BUTTON } from "./buttonStyles";

export type ServiceGroupOption = {
  id: string;
  name: string;
  /** How many the plan includes, or null when agreed per client. */
  limit: number | null;
  services: { id: string; name: string }[];
};

type ServicesFormProps = {
  action: (state: SubscriptionFormState, form: FormData) => Promise<SubscriptionFormState>;
  groups: ServiceGroupOption[];
  selected: string[];
  submitLabel: string;
};

export function ServicesForm({ action, groups, selected, submitLabel }: ServicesFormProps) {
  const [state, formAction, pending] = useActionState(action, { formError: null });
  const [chosen, setChosen] = useState(selected);
  const toggle = (id: string) => setChosen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  return (
    <form action={formAction} aria-label="Your services" className="flex flex-col gap-7">
      {groups.map((group) => {
        const picked = group.services.filter((service) => chosen.includes(service.id)).length;
        const full = group.limit !== null && picked >= group.limit;
        const countId = `${group.id}-count`;

        return (
          <fieldset key={group.id} aria-describedby={countId} className="flex flex-col gap-4 rounded-xl border border-line-light bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
              <legend className="font-display text-[1.4rem] font-extrabold">{group.name}</legend>
              {group.limit !== null && (
                <p id={countId} aria-live="polite" className="font-semibold text-maroon">
                  {picked} of {group.limit} chosen
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {group.services.map((service) => {
                const isChosen = chosen.includes(service.id);
                return (
                  <label
                    key={service.id}
                    className="flex min-h-13 cursor-pointer items-center gap-3 rounded-lg border-2 border-line-light px-4 py-3 has-[:checked]:border-maroon has-[:checked]:bg-paper has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-55"
                  >
                    <input
                      type="checkbox"
                      name="service"
                      value={service.id}
                      checked={isChosen}
                      disabled={full && !isChosen}
                      onChange={() => toggle(service.id)}
                      className="h-5 w-5 shrink-0 accent-maroon"
                    />
                    {service.name}
                  </label>
                );
              })}
            </div>
            {full && (
              <p className="text-[0.94rem] text-on-light-dim">To pick another, unselect one first, or move to a bigger plan.</p>
            )}
          </fieldset>
        );
      })}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={PRIMARY_BUTTON}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <a href="/account" className="font-semibold text-maroon underline hover:text-maroon-bright">
          Cancel
        </a>
      </div>
      <p role="status" aria-live="polite" className="font-semibold text-maroon empty:hidden">
        {state.formError}
      </p>
    </form>
  );
}
