"use client";

import { useEffect, useState } from "react";
import BottomNav, { type NavItem } from "@/components/BottomNav";
import DemoPanel from "@/components/DemoPanel";
import DeliveryPage from "@/components/diner/DeliveryPage";
import DiningList from "@/components/diner/DiningList";
import NewsPage from "@/components/diner/NewsPage";
import ReportPage from "@/components/diner/ReportPage";
import RestaurantDetail from "@/components/diner/RestaurantDetail";
import ComplaintsInbox from "@/components/manager/ComplaintsInbox";
import DeliveryCheck from "@/components/manager/DeliveryCheck";
import DiningCheck from "@/components/manager/DiningCheck";
import ManagerHome from "@/components/manager/ManagerHome";
import PhoneFrame from "@/components/PhoneFrame";
import { restaurants } from "@/data/restaurants";
import type { DinerTab, ManagerTab, Role } from "@/lib/types";
import { useNow } from "@/lib/useNow";

const DINER_NAV: NavItem<DinerTab>[] = [
  { id: "dining", label: "Dining", icon: "dining" },
  { id: "delivery", label: "Delivery", icon: "delivery" },
  { id: "news", label: "News", icon: "news" },
  { id: "report", label: "Report", icon: "flag" },
];

const MANAGER_NAV: NavItem<ManagerTab>[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "dining", label: "Dining", icon: "dining" },
  { id: "delivery", label: "Delivery", icon: "delivery" },
  { id: "complaints", label: "Complaints", icon: "inbox" },
];

const STORAGE_KEY = "kt-ui-v1";

interface UiState {
  role: Role;
  dinerTab: DinerTab;
  managerTab: ManagerTab;
  restaurantId: string;
  openRestaurant: boolean; // diner is viewing one restaurant's page
  showExpected: boolean; // demo photos show their expected AI result
}

const DEFAULTS: UiState = {
  role: "diner",
  dinerTab: "dining",
  managerTab: "home",
  restaurantId: restaurants[0].id,
  openRestaurant: false,
  showExpected: false,
};

export default function Home() {
  const [ui, setUi] = useState<UiState>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const clock = useNow();

  // Read saved state after the first render (localStorage only exists in the browser).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<UiState>) };
        if (!restaurants.some((r) => r.id === saved.restaurantId)) saved.restaurantId = DEFAULTS.restaurantId;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUi(saved);
      }
    } catch {
      // Blocked or corrupt storage: start from the defaults.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ui));
    } catch {
      // Storage full or blocked: the app still works for this session.
    }
  }, [ui, ready]);

  const restaurant = restaurants.find((r) => r.id === ui.restaurantId) ?? restaurants[0];
  const patch = (p: Partial<UiState>) => setUi((s) => ({ ...s, ...p }));

  function renderDiner() {
    switch (ui.dinerTab) {
      case "dining":
        return ui.openRestaurant ? (
          <RestaurantDetail key={restaurant.id} restaurant={restaurant} clock={clock} onBack={() => patch({ openRestaurant: false })} />
        ) : (
          <DiningList restaurants={restaurants} onOpen={(id) => patch({ restaurantId: id, openRestaurant: true })} />
        );
      case "delivery":
        return (
          <DeliveryPage
            key={restaurant.id}
            restaurants={restaurants}
            restaurant={restaurant}
            onSelect={(id) => patch({ restaurantId: id })}
            clock={clock}
          />
        );
      case "news":
        return <NewsPage />;
      case "report":
        return (
          <ReportPage
            key={restaurant.id}
            restaurants={restaurants}
            restaurant={restaurant}
            onSelect={(id) => patch({ restaurantId: id })}
          />
        );
    }
  }

  function renderManager() {
    switch (ui.managerTab) {
      case "home":
        return (
          <ManagerHome
            key={restaurant.id}
            restaurant={restaurant}
            onGo={(tab) => patch({ managerTab: tab })}
            onPreview={() => patch({ role: "diner", dinerTab: "dining", openRestaurant: true })}
          />
        );
      case "dining":
        return <DiningCheck key={restaurant.id} restaurant={restaurant} showExpected={ui.showExpected} />;
      case "delivery":
        return <DeliveryCheck key={restaurant.id} restaurant={restaurant} showExpected={ui.showExpected} />;
      case "complaints":
        return <ComplaintsInbox key={restaurant.id} restaurant={restaurant} />;
    }
  }

  return (
    <PhoneFrame>
      <main className="screen" aria-label={ui.role === "diner" ? "Diner app" : "Manager app"}>
        {ui.role === "diner" ? renderDiner() : renderManager()}
      </main>

      <DemoPanel
        role={ui.role}
        onRole={(role) => patch({ role })}
        restaurants={restaurants}
        restaurantId={ui.restaurantId}
        onRestaurant={(id) => patch({ restaurantId: id, openRestaurant: false })}
        showExpected={ui.showExpected}
        onShowExpected={(showExpected) => patch({ showExpected })}
      />

      {ui.role === "diner" ? (
        <BottomNav items={DINER_NAV} active={ui.dinerTab} onChange={(t) => patch({ dinerTab: t, openRestaurant: false })} label="Diner navigation" />
      ) : (
        <BottomNav items={MANAGER_NAV} active={ui.managerTab} onChange={(t) => patch({ managerTab: t })} label="Manager navigation" />
      )}
    </PhoneFrame>
  );
}
