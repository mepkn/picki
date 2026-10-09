import React, { useEffect, useState, useMemo } from "react";
import { ConvexProvider, ConvexReactClient, useQuery, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { ListDoc, ListItem, SelectionRecord, SelectionResult, SelectionMode, AnimationTheme } from "./types";
import { PickiContext, type PickiContextType } from "./picki-context";


function ConvexStoreProvider({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const rawLists = useQuery(api.lists.getAllLists);
  const [activeSelectingId, setActiveSelectingId] = useState<string | null>(null);

  // Cache live items and selections per list
  const [cachedItems, setCachedItems] = useState<Record<string, ListItem[]>>({});
  const [cachedSelections, setCachedSelections] = useState<Record<string, SelectionRecord[]>>({});

  const lists: ListDoc[] = useMemo(() => {
    if (!rawLists) return [];
    return rawLists.map((l) => ({
      _id: l._id as string,
      name: l.name,
      slug: l.slug,
      selectionMode: l.selectionMode as SelectionMode,
      currentRound: l.currentRound,
      animationDuration: l.animationDuration ?? 2.5,
      reducedMotion: l.reducedMotion ?? false,
      animationTheme: (l.animationTheme as AnimationTheme) ?? "cyber_hud",
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      itemCount: l.itemCount,
      selectedThisRound: l.selectedThisRound,
    }));
  }, [rawLists]);

  const getListBySlug = (slug: string) => {
    return lists.find((l) => l.slug === slug);
  };

  const getItems = (listId: string): ListItem[] => {
    return cachedItems[listId] || [];
  };

  const getSelections = (listId: string): SelectionRecord[] => {
    return cachedSelections[listId] || [];
  };

  // Sync items & selections for visible lists
  useEffect(() => {
    if (lists.length === 0) return;
    let isCancelled = false;

    const syncData = async () => {
      for (const list of lists) {
        try {
          const itemsData = await convex.query(api.items.getItems, {
            listId: list._id as Id<"lists">,
          });
          const selectionsData = await convex.query(api.selections.getSelections, {
            listId: list._id as Id<"lists">,
          });

          if (!isCancelled) {
            setCachedItems((prev) => ({
              ...prev,
              [list._id]: itemsData.map((i) => ({
                _id: i._id as string,
                listId: i.listId as string,
                value: i.value,
                createdAt: i.createdAt,
                updatedAt: i.updatedAt,
              })),
            }));

            setCachedSelections((prev) => ({
              ...prev,
              [list._id]: selectionsData.map((s) => ({
                _id: s._id as string,
                listId: s.listId as string,
                itemId: s.itemId as string | undefined,
                itemValue: s.itemValue,
                round: s.round,
                selectionNumber: s.selectionNumber,
                selectedAt: s.selectedAt,
              })),
            }));
          }
        } catch {
          // ignore transient poll error
        }
      }
    };

    syncData();
    return () => {
      isCancelled = true;
    };
  }, [lists, convex]);

  const createList = async (params: {
    name: string;
    items?: string[];
    selectionMode?: SelectionMode;
    animationTheme?: AnimationTheme;
  }) => {
    const res = await convex.mutation(api.lists.createList, {
      name: params.name,
      items: params.items,
      selectionMode: params.selectionMode,
      animationTheme: params.animationTheme,
    });
    return { listId: res.listId as string, slug: res.slug };
  };

  const updateList = async (params: {
    listId: string;
    name?: string;
    selectionMode?: SelectionMode;
    animationDuration?: number;
    reducedMotion?: boolean;
    animationTheme?: AnimationTheme;
  }) => {
    await convex.mutation(api.lists.updateList, {
      listId: params.listId as Id<"lists">,
      name: params.name,
      selectionMode: params.selectionMode,
      animationDuration: params.animationDuration,
      reducedMotion: params.reducedMotion,
      animationTheme: params.animationTheme,
    });
  };

  const deleteList = async (listId: string) => {
    await convex.mutation(api.lists.deleteList, {
      listId: listId as Id<"lists">,
    });
  };

  const duplicateList = async (listId: string) => {
    const res = await convex.mutation(api.lists.duplicateList, {
      listId: listId as Id<"lists">,
    });
    return { listId: res.listId as string, slug: res.slug };
  };

  const startNewRound = async (listId: string) => {
    const res = await convex.mutation(api.lists.startNewRound, {
      listId: listId as Id<"lists">,
    });
    return res;
  };

  const addItem = async (listId: string, value: string) => {
    const res = await convex.mutation(api.items.addItem, {
      listId: listId as Id<"lists">,
      value,
    });
    const itemsData = await convex.query(api.items.getItems, {
      listId: listId as Id<"lists">,
    });
    setCachedItems((prev) => ({
      ...prev,
      [listId]: itemsData.map((i) => ({
        _id: i._id as string,
        listId: i.listId as string,
        value: i.value,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
    }));
    return res as string;
  };

  const addItemsBulk = async (listId: string, values: string[]) => {
    const res = await convex.mutation(api.items.addItemsBulk, {
      listId: listId as Id<"lists">,
      values,
    });
    const itemsData = await convex.query(api.items.getItems, {
      listId: listId as Id<"lists">,
    });
    setCachedItems((prev) => ({
      ...prev,
      [listId]: itemsData.map((i) => ({
        _id: i._id as string,
        listId: i.listId as string,
        value: i.value,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
    }));
    return res as string[];
  };

  const updateItem = async (itemId: string, value: string) => {
    await convex.mutation(api.items.updateItem, {
      itemId: itemId as Id<"items">,
      value,
    });
  };

  const deleteItem = async (itemId: string) => {
    await convex.mutation(api.items.deleteItem, {
      itemId: itemId as Id<"items">,
    });
  };

  const clearItems = async (listId: string) => {
    await convex.mutation(api.items.clearItems, {
      listId: listId as Id<"lists">,
    });
    setCachedItems((prev) => ({ ...prev, [listId]: [] }));
  };

  const selectRandomItem = async (listId: string): Promise<SelectionResult> => {
    if (activeSelectingId === listId) {
      throw new Error("A selection is already in progress.");
    }
    setActiveSelectingId(listId);
    try {
      const res = await convex.mutation(api.selections.selectRandomItem, {
        listId: listId as Id<"lists">,
      });

      const newRecord: SelectionRecord = {
        _id: res.selectionId as string,
        listId,
        itemId: res.selectedItem._id as string,
        itemValue: res.selectedItem.value,
        round: res.round,
        selectionNumber: res.selectionNumber,
        selectedAt: Date.now(),
      };

      setCachedSelections((prev) => ({
        ...prev,
        [listId]: [newRecord, ...(prev[listId] || [])],
      }));

      // Background sync selections in case of round resets
      convex.query(api.selections.getSelections, {
        listId: listId as Id<"lists">,
      }).then((selectionsData) => {
        setCachedSelections((prev) => ({
          ...prev,
          [listId]: selectionsData.map((s) => ({
            _id: s._id as string,
            listId: s.listId as string,
            itemId: s.itemId as string | undefined,
            itemValue: s.itemValue,
            round: s.round,
            selectionNumber: s.selectionNumber,
            selectedAt: s.selectedAt,
          })),
        }));
      }).catch(() => {});

      return {
        selectionId: res.selectionId as string,
        selectedItem: {
          _id: res.selectedItem._id as string,
          value: res.selectedItem.value,
        },
        round: res.round,
        selectionNumber: res.selectionNumber,
        isRoundComplete: res.isRoundComplete,
        remainingInRound: res.remainingInRound,
        autoRestarted: res.autoRestarted,
      };
    } finally {
      setActiveSelectingId(null);
    }
  };

  const clearSelections = async (listId: string) => {
    await convex.mutation(api.selections.clearSelections, {
      listId: listId as Id<"lists">,
    });
    setCachedSelections((prev) => ({ ...prev, [listId]: [] }));
  };

  const deleteSelection = async (selectionId: string) => {
    await convex.mutation(api.selections.deleteSelection, {
      selectionId: selectionId as Id<"selections">,
    });
    setCachedSelections((prev) => {
      const updated: Record<string, SelectionRecord[]> = {};
      for (const [lId, records] of Object.entries(prev)) {
        updated[lId] = records.filter((r) => r._id !== selectionId);
      }
      return updated;
    });
  };

  const value: PickiContextType = {
    lists,
    getListBySlug,
    getItems,
    getSelections,
    createList,
    updateList,
    deleteList,
    duplicateList,
    startNewRound,
    addItem,
    addItemsBulk,
    updateItem,
    deleteItem,
    clearItems,
    selectRandomItem,
    clearSelections,
    deleteSelection,
  };

  return <PickiContext.Provider value={value}>{children}</PickiContext.Provider>;
}

export function PickiProvider({ children }: { children: React.ReactNode }) {
  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  const convexClient = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);

  return (
    <ConvexProvider client={convexClient}>
      <ConvexStoreProvider>{children}</ConvexStoreProvider>
    </ConvexProvider>
  );
}
