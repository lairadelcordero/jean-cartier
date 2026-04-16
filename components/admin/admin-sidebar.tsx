"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  MdOutlineAdminPanelSettings,
  MdOutlineArticle,
  MdOutlineGroup,
  MdOutlineSpaceDashboard,
} from "react-icons/md";

type NavLeaf = { href: string; label: string; icon: ReactNode };

const groups: Array<{ title: string; items: NavLeaf[] }> = [
  {
    title: "General",
    items: [
      { href: "/admin", label: "Resumen", icon: <MdOutlineSpaceDashboard className="h-5 w-5" /> },
    ],
  },
  {
    title: "Licencias",
    items: [
      {
        href: "/admin/licenses",
        label: "Licencias",
        icon: <MdOutlineArticle className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "Licenciatarios",
    items: [
      {
        href: "/admin/licenciatarios",
        label: "Licenciatarios",
        icon: <MdOutlineGroup className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        href: "/admin/users",
        label: "Usuarios",
        icon: <MdOutlineAdminPanelSettings className="h-5 w-5" />,
      },
    ],
  },
];

function linkClass(active: boolean) {
  return [
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
    active
      ? "bg-jc-gray-100 text-jc-black"
      : "text-jc-gray-700 hover:bg-jc-gray-50 hover:text-jc-black",
  ].join(" ");
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-xl border border-jc-gray-100 bg-jc-white p-3 shadow-jc">
      <nav className="space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-jc-gray-500">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.href} href={item.href} className={linkClass(active)}>
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
