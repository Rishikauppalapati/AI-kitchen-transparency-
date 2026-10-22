"use client";

import { useEffect, useState } from "react";
import AppBar from "@/components/AppBar";
import BottomNav, { type NavItem } from "@/components/BottomNav";
import ComingSoon from "@/components/ComingSoon";
import DemoPanel from "@/components/DemoPanel";
import DeliveryPage from "@/components/diner/DeliveryPage";
import DiningList from "@/components/diner/DiningList";
import NewsPage from "@/components/diner/NewsPage";
import ReportPage from "@/components/diner/ReportPage";
import RestaurantDetail from "@/components/diner/RestaurantDetail";
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
}

const DEFAULTS: UiState = {
  role: "diner",
  dinerTab: "dining",
  managerTab: "home",
  restaurantId: restaurants[0].id,
  openRestaurant: false,
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
        return <ManagerHome restaurant={restaurant} onGo={(tab) => patch({ managerTab: tab })} />;
      case "dining":
        return (
          <>
            <AppBar title="Dining check" subtitle={restaurant.name} />
            <ComingSoon icon="dining" title="Six check tiles and OTP sign-off" step={3} items={["Five photo tiles judged by AI, one typed fridge reading", "Retake notes and documents-due chip", "Sign off with OTP (demo code 1234)"]} />
          </>
        );
      case "delivery":
        return (
          <>
            <AppBar title="Delivery check" subtitle={restaurant.name} />
            <ComingSoon icon="delivery" title="Setup, random pack check, handled for you" step={3} items={["Shift setup: three photo checks, twice a day", "Random pack check with a 10-minute countdown", "Simulated rider and handover data"]} />
          </>
        );
      case "complaints":
        return (
          <>
            <AppBar title="Complaints" subtitle={restaurant.name} />
            <ComingSoon icon="inbox" title="Complaints inbox" step={3} items={["Category and seal status for each complaint", "Record the fix (text and photo)", "Resolving updates the diner's history"]} />
          </>
        );
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
      />

      {ui.role === "diner" ? (
        <BottomNav items={DINER_NAV} active={ui.dinerTab} onChange={(t) => patch({ dinerTab: t, openRestaurant: false })} label="Diner navigation" />
      ) : (
        <BottomNav items={MANAGER_NAV} active={ui.managerTab} onChange={(t) => patch({ managerTab: t })} label="Manager navigation" />
      )}
    </PhoneFrame>
  );
}
