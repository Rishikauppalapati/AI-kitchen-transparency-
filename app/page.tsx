"use client";

import { useEffect, useRef, useState } from "react";
import BottomNav, { type NavItem } from "@/components/BottomNav";
import Brand from "@/components/Brand";
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
import { NotificationBanner, NotificationBell } from "@/components/manager/Notifications";
import PhoneFrame from "@/components/PhoneFrame";
import { restaurants } from "@/data/restaurants";
import { AppProvider, useApp } from "@/lib/AppState";
import { AUTO_NOTIFY_MS, AUTO_SEQUENCE } from "@/lib/notifications";
import { PACK_PER_DAY, packToday } from "@/lib/state";
import type { DinerTab, ManagerTab, Role } from "@/lib/types";

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
  autoNotify: boolean; // a reminder pops up by itself on a timer while in the Manager view
}

const DEFAULTS: UiState = {
  role: "diner",
  dinerTab: "dining",
  managerTab: "home",
  restaurantId: restaurants[0].id,
  openRestaurant: false,
  autoNotify: true,
};

export default function Home() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

function Shell() {
  const { data, now, act, reset } = useApp();
  const [ui, setUi] = useState<UiState>(DEFAULTS);
  const [ready, setReady] = useState(false);

  // Auto notifications (for showing the app to someone): while in the Manager view, a reminder pops up every
  // couple of minutes, cycling through the list. It waits while a sheet is open or an earlier reminder is
  // still unread, and skips a pack check that can't start.
  const latest = useRef({ data, now, act });
  useEffect(() => {
    latest.current = { data, now, act };
  });
  const autoIndex = useRef(0);
  useEffect(() => {
    if (!ready || !ui.autoNotify || ui.role !== "manager") return;
    const id = setInterval(() => {
      if (document.querySelector(".sheet")) return; // don't pop over something the presenter is using
      const { data, now, act } = latest.current;
      const rd = data.restaurants[ui.restaurantId];
      if (rd.notices.some((n) => !n.read)) return; // an earlier reminder hasn't been opened yet: don't pile on another
      const packBlocked = rd.packPendingSince !== null || packToday(rd, now).results.length >= PACK_PER_DAY;
      for (let tries = 0; tries < AUTO_SEQUENCE.length; tries++) {
        const slot = AUTO_SEQUENCE[autoIndex.current++ % AUTO_SEQUENCE.length];
        if (slot.startsWith("pack") && packBlocked) continue;
        act({ type: "notify", rid: ui.restaurantId, slot });
        return;
      }
    }, AUTO_NOTIFY_MS);
    return () => clearInterval(id);
  }, [ready, ui.autoNotify, ui.role, ui.restaurantId]);

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
          <RestaurantDetail key={restaurant.id} restaurant={restaurant} onBack={() => patch({ openRestaurant: false })} />
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
        return <DiningCheck key={restaurant.id} restaurant={restaurant} showExpected={false} liveDemo={false} />;
      case "delivery":
        return <DeliveryCheck key={restaurant.id} restaurant={restaurant} showExpected={false} liveDemo={false} />;
      case "complaints":
        return <ComplaintsInbox key={restaurant.id} restaurant={restaurant} />;
    }
  }

  return (
    <PhoneFrame>
      <Brand />
      <main className="screen" aria-label={ui.role === "diner" ? "Diner app" : "Manager app"}>
        {ui.role === "diner" ? renderDiner() : renderManager()}
      </main>

      {ui.role === "manager" && (
        <>
          <NotificationBell restaurantId={restaurant.id} onStart={(n) => patch({ managerTab: n.target })} />
          <NotificationBanner restaurantId={restaurant.id} onStart={(n) => patch({ managerTab: n.target })} />
        </>
      )}

      <DemoPanel
        role={ui.role}
        onRole={(role) => patch({ role })}
        restaurants={restaurants}
        restaurantId={ui.restaurantId}
        onRestaurant={(id) => patch({ restaurantId: id, openRestaurant: false })}
        autoNotify={ui.autoNotify}
        onAutoNotify={(autoNotify) => patch({ autoNotify })}
        onReset={() => {
          reset();
          setUi(DEFAULTS);
        }}
      />

      {ui.role === "diner" ? (
        <BottomNav items={DINER_NAV} active={ui.dinerTab} onChange={(t) => patch({ dinerTab: t, openRestaurant: false })} label="Diner navigation" />
      ) : (
        <BottomNav items={MANAGER_NAV} active={ui.managerTab} onChange={(t) => patch({ managerTab: t })} label="Manager navigation" />
      )}
    </PhoneFrame>
  );
}
