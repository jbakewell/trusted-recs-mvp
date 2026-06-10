import { BrandMark } from "@/components/brand/BrandMark";
import { OverprintBackground } from "@/components/visual/OverprintBackground";
import { CreateGroupForm } from "./CreateGroupForm";

export default function NewGroupPage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-bg-page">
      <OverprintBackground density="subtle" route="landing" seed="create-group" />
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
