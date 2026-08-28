import { useState } from "react";

export interface TabItem {
  id: string;
  title: string;
}

export function useTabStore() {
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: "main", title: "Ana Çalışma Alanı" },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("main");

  const setActiveTab = (id: string) => {
    setActiveTabId(id);
  };

  const addTab = (newTab: TabItem) => {
    if (!tabs.some((t) => t.id === newTab.id)) {
      setTabs((prev) => [...prev, newTab]);
    }
    setActiveTabId(newTab.id);
  };

  const removeTab = (id: string) => {
    if (tabs.length <= 1) return;
    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  return {
    tabs,
    activeTabId,
    setActiveTab,
    addTab,
    removeTab,
  };
}
