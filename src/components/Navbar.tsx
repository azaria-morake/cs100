'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dissections' },
    { href: '/principles', label: 'First Principles' },
    { href: '/papers', label: 'Formal Papers' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/audits', label: 'System Audits' },
    { href: '/manifesto', label: 'Manifesto' },
    { href: '/admin', label: '⚡ Admin CMS' },
  ];

  return (
    <nav className="publication-nav">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={isActive ? 'active' : ''}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
