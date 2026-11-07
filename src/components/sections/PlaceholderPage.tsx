import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AUDIT_PATH } from "@/shared/constants";

// Temporary stand-in so navigation links work while the real pages are built.
// Delete this once /services and /pricing have replaced it.
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Container data-page-hero className="pb-24 pt-36">
      <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] font-bold">{title}</h1>
      <p className="mt-5 text-paper-dim">This page is being built.</p>
      <Button href={AUDIT_PATH} className="mt-8">
        Book a free audit
      </Button>
    </Container>
  );
}
