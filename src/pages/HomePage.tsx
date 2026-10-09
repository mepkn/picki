import { useState } from "react";
import { Zap, Search } from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { CyberButton } from "@/components/ui/CyberButton";
import { ListCard } from "@/components/lists/ListCard";
import { CreateListModal } from "@/components/lists/CreateListModal";
import { usePicki } from "@/lib/picki-context";

export function HomePage() {
  const { lists } = usePicki();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLists = lists.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* Primary CTA Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-4 sm:pt-10 sm:pb-6 max-w-4xl mx-auto w-full text-center">
          {/* Primary CTA */}
          <div className="flex justify-center">
            <CyberButton
              variant="cyber"
              size="xl"
              onClick={() => setShowCreateModal(true)}
              className="gap-3 w-full sm:w-auto"
            >
              <Zap className="w-5 h-5 text-cyan-300" />
              <span>Create a List</span>
            </CyberButton>
          </div>
        </section>

        {/* Lists Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">Lists</h2>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                {lists.length}
              </span>
            </div>

            {lists.length > 3 && (
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter lists..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400/70 font-mono"
                />
              </div>
            )}
          </div>

          {filteredLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLists.map((list) => (
                <ListCard key={list._id} list={list} />
              ))}
            </div>
          ) : lists.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm font-mono">
              No lists created yet. Click &ldquo;Create a List&rdquo; above to begin.
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm font-mono">
              No lists match &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </section>
      </main>

      {showCreateModal && <CreateListModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
