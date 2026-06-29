import { Smartphone, Headphones, Tv, Gamepad2, Laptop, Cpu } from 'lucide-react';

// Shared with CategoryGrid.jsx and Navbar.jsx's mega-menu so both stay
// visually consistent — one icon per category value, not redeclared.
export const CATEGORY_ICONS = {
  phones: Smartphone,
  accessories: Headphones,
  tvs: Tv,
  gaming: Gamepad2,
  laptops: Laptop,
  electronics: Cpu,
};
