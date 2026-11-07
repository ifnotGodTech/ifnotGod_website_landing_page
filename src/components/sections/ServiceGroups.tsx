import { Container } from "@/components/ui/Container";
import { getPlans, getServiceGroups } from "@/lib/catalogue";
import { groupAllowanceSummary, listedServices, lowestPlanLabel } from "@/lib/catalogue/rules";
import type { Plan, Service, ServiceGroupWithServices } from "@/types/catalogue";

const AGENT_NOTE = "Every agent hands over to a person when it should, and AI usage is billed at cost.";

export async function ServiceGroups() {
  const [groups, plans] = await Promise.all([getServiceGroups(), getPlans()]);

  return (
    <>
      {groups.map((group) =>
        group.id === "agents" ? (
          <AgentGroup key={group.id} group={group} plans={plans} />
        ) : (
          <StandardGroup key={group.id} group={group} plans={plans} />
        )
      )}
    </>
  );
}

type GroupProps = {
  group: ServiceGroupWithServices;
  plans: Plan[];
};

function GroupHeading({ group, plans }: GroupProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <h2 className="text-[1.9rem] font-extrabold tracking-[-0.02em]">{group.name}</h2>
      <p className="text-[0.94rem]">{groupAllowanceSummary(group, plans)}</p>
    </div>
  );
}

function ProblemLine({ service }: { service: Service }) {
  return (
    <>
      &ldquo;{service.problem}&rdquo;{service.note && ` ${service.note}`}
    </>
  );
}

function StandardGroup({ group, plans }: GroupProps) {
  return (
    <section className="py-8">
      <Container className="flex flex-col gap-5">
        <GroupHeading group={group} plans={plans} />
        <ul className="grid grid-cols-1 gap-x-10 border-t border-line-strong md:grid-cols-2 xl:grid-cols-3">
          {listedServices(group.services).map((service) => (
            <li key={service.id} className="flex flex-col gap-1 border-b border-line py-5">
              <h3 className="text-[1.25rem] font-bold">{service.name}</h3>
              <p className="grow text-paper-dim">
                <ProblemLine service={service} />
              </p>
              <span className="pt-1 text-[0.88rem] text-paper-dim">{lowestPlanLabel(service, plans)}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function AgentGroup({ group, plans }: GroupProps) {
  return (
    <section className="pt-8">
      <Container>
        <div className="surface-maroon flex flex-col gap-5.5 rounded-xl p-6 sm:p-10">
          <GroupHeading group={group} plans={plans} />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {listedServices(group.services).map((service) => (
              <li
                key={service.id}
                className="flex flex-col gap-2 rounded-lg bg-[color-mix(in_srgb,var(--color-maroon)_75%,black)] p-5.5"
              >
                <h3 className="text-[1.25rem] font-bold">{service.name}</h3>
                <p className="grow">
                  <ProblemLine service={service} />
                </p>
                <span className="text-[0.88rem]">{lowestPlanLabel(service, plans)}</span>
              </li>
            ))}
          </ul>
          <p>{AGENT_NOTE}</p>
        </div>
      </Container>
    </section>
  );
}
