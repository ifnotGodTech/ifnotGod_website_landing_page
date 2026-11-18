import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AUDIT_PATH } from "@/shared/constants";

type ClosingCtaProps = {
  title: string;
  detail?: string;
};

export function ClosingCta({ title, detail }: ClosingCtaProps) {
  return (
    <section className="surface-maroon">
      <Container className="flex flex-wrap items-center justify-between gap-7 py-16 sm:py-20">
        <div className="flex max-w-[36em] flex-col gap-2">
          <h2 className="text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.1] tracking-[-0.025em]">{title}</h2>
          {detail && <p className="text-[1.1rem]">{detail}</p>}
        </div>
        <Button href={AUDIT_PATH} variant="paper">
          Book a free automation audit
        </Button>
      </Container>
    </section>
  );
}
