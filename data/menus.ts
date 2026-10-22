// Fake menus for the fake "Order now" sheet.
export interface MenuItem {
  id: string;
  name: string;
  price: number; // rupees
}

export const menus: Record<string, MenuItem[]> = {
  "sample-cafe": [
    { id: "m1", name: "Filter coffee", price: 90 },
    { id: "m2", name: "Veg puff", price: 60 },
    { id: "m3", name: "Paneer sandwich", price: 160 },
  ],
  "sample-biryani-house": [
    { id: "m1", name: "Chicken dum biryani", price: 320 },
    { id: "m2", name: "Veg biryani", price: 240 },
    { id: "m3", name: "Raita", price: 40 },
  ],
  "sample-bakery": [
    { id: "m1", name: "Butter croissant", price: 80 },
    { id: "m2", name: "Whole wheat loaf", price: 110 },
    { id: "m3", name: "Chocolate muffin", price: 95 },
  ],
};
