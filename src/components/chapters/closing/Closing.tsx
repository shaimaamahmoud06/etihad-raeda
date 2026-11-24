import { Link } from "@/i18n/navigation";
import { closing } from "@/content/pages/home";
import { Monogram } from "@/components/ui/Monogram";
import { SplitWords } from "@/components/ui/SplitWords";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Arrow } from "@/components/ui/Arrow";
import type { ChapterProps } from "../registry";

/* Ch.11 Closing chord. Both doors, side by side. */
export function Closing({ locale, pageUrl }: ChapterProps) {
  const c = closing;
  return (
    <div className="lattice flex min-h-[85svh] flex-col items-center justify-center py-28 text-center">
      <div className="shell flex flex-col items-center">
        <span className="block size-16 sm:size-20">
          <Monogram size="100%" strokeWidth={2.2} draw />
        </span>
        <SplitWords as="h2" id="ch-closing-title" text={c.headline[locale]} className="display t-hero mt-12 max-w-[16ch]" />
        <div data-reveal="" className="mt-14 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <Link href={c.primary.href} className="btn btn-solid">
            {c.primary.label[locale]}
            <Arrow />
          </Link>
          <WhatsAppButton locale={locale} label={c.whatsappLabel[locale]} pageUrl={pageUrl} placement="home-closing" />
        </div>
      </div>
    </div>
  );
}
