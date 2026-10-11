import { WorkspaceScene } from "@/components/scene/workspace-scene";
import { defaultSetup } from "@/data/presets";

// Interim page: shows the scene for the default setup until the builder UI lands.
export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight">
        Design your Bali workspace
      </h1>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <WorkspaceScene setup={defaultSetup()} />
      </div>
    </main>
  );
}
