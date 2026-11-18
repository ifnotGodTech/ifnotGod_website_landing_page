import { redirect } from "next/navigation";
import { AccountBand } from "@/components/account/AccountBand";
import { ServicesForm } from "@/components/account/ServicesForm";
import { Container } from "@/components/ui/Container";
import { requireSession } from "@/lib/accounts";
import { loadAccount } from "@/lib/accounts/account";
import { updateServicesAction } from "@/lib/accounts/subscriptionActions";
import { buildPageMetadata } from "@/shared/metadata";

export const metadata = buildPageMetadata({
  title: "Your services | IFNOTGOD TECH LTD",
  description: "Choose the services in your IFNOTGOD TECH plan.",
  path: "/account/services",
  index: false,
});

export default async function ServicesPage({ searchParams }: PageProps<"/account/services">) {
  const { token } = await requireSession("/account/services");
  const [{ subscription, plan, choices }, { welcome }] = await Promise.all([loadAccount(token), searchParams]);
  if (subscription?.status !== "active" || !plan) redirect("/account");

  const firstTime = subscription.serviceIds.length === 0;
  const changes = subscription.changesLeftThisMonth;

  return (
    <>
      <AccountBand
        back
        title={firstTime ? "Choose your services" : "Change your services"}
        intro={
          <div className="flex flex-col gap-3">
            {welcome && <p className="font-semibold text-paper">Payment received. Welcome to {plan.name}.</p>}
            <p>
              Your {plan.name} plan includes {choices.map((choice) => choice.label).join(", ")}. Pick the ones you
              want.
            </p>
            {firstTime ? (
              <p>Choosing your first services doesn&apos;t use any of your monthly changes.</p>
            ) : (
              <p>
                <span className="rounded-full bg-maroon px-3 py-1 font-bold text-paper">
                  {changes} {changes === 1 ? "change" : "changes"} left this month
                </span>{" "}
                Each swapped service uses one.
              </p>
            )}
          </div>
        }
      />
      <Container className="pb-22 pt-10">
        <ServicesForm
          action={updateServicesAction}
          groups={choices.map((choice) => ({
            id: choice.group.id,
            name: choice.group.name,
            limit: typeof choice.allowance === "number" ? choice.allowance : null,
            services: choice.services.map((service) => ({ id: service.id, name: service.name })),
          }))}
          selected={subscription.serviceIds}
          submitLabel={firstTime ? "Save my services" : "Save changes"}
        />
        <p className="mt-6 max-w-[44em] text-on-light-dim">
          We&apos;ll confirm with you before we switch anything over, so nothing stops working in the meantime.
        </p>
      </Container>
    </>
  );
}
