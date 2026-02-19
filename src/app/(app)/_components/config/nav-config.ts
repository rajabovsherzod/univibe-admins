export type Role = "staff" | "university_admin";

export type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

const common: NavSection[] = [
  {
    title: "Umumiy",
    items: [
      { label: "Dashboard", href: "/dashboard" }, // This might need to be dynamic or relative
      { label: "Sozlamalar", href: "/settings" },
      { label: "Profil", href: "/profile" },
    ],
  },
];

const staffNav: NavSection[] = [
  {
    title: "Xodim",
    items: [
      { label: "Tadbirlar", href: "/events" },
      { label: "Talabalar", href: "/students" },
    ],
  },
];

const adminNav: NavSection[] = [
  {
    title: "Admin",
    items: [
      { label: "Adminlar", href: "/admins" },
      { label: "Fakultetlar", href: "/faculties" }, // Ensure route exists or adjust href
      { label: "Tizim", href: "/system" },
    ],
  },
];

export function getAppNav(role: string): NavSection[] {
  // No prefix logic needed for now if routes are generic
  return role === "university_admin"
    ? [...common, ...adminNav]
    : [...common, ...staffNav];
}
