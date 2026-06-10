import { BrandMark } from "@/components/brand/BrandMark";
import { OverprintBackground, pickOverprintBackgroundIndex } from "@/components/visual/OverprintBackground";
import { CreateGroupForm } from "./CreateGroupForm";

export const dynamic = "force-dynamic";

export default function NewGroupPage() {
  const backgroundIndex = pickOverprintBackgroundIndex();

  return (
    <main className="relative isolate min-h-dvh overflow-x-hidden bg-bg-page">
      <OverprintBackground backgroundIndex={backgroundIndex} density="subtle" route="landing" />
      <section className="relative z-10 mx-auto grid w-full max-w-[480px] gap-6 px-5 pb-10 pt-8 lg:max-w-2xl">
        <div className="flex items-center gap-3 pt-4">
          <BrandMark />
          <p className="metadata-label text-text-secondary">Private movie lists</p>
        </div>
        <CreateGroupForm />
      </section>
    </main>
  );
}
