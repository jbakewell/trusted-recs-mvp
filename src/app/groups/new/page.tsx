import { BrandMark } from "@/components/brand/BrandMark";
import { CreateGroupForm } from "./CreateGroupForm";

export default function NewGroupPage() {
  return (
    <main className="main-container">
      <section className="mx-auto grid max-w-2xl gap-6">
        <div className="flex items-center gap-3 pt-4">
          <BrandMark />
          <p className="metadata-label text-text-secondary">Private movie lists</p>
        </div>
        <CreateGroupForm />
      </section>
    </main>
  );
}
