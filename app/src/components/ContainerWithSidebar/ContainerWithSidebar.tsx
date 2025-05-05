'use client';
import { PropsWithChildren, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './container-with-sidebar.scss';

interface AppContainerProps {}

interface SidebarLink {
  path: string;
  name: string;
  icon?: ReactNode;
}

export const DefaultSidebarLinks: Array<SidebarLink> = [
    { path: '/upload', name: 'Upload' },
    { path: '/search', name: 'Search' },
];

export function ContainerWithSidebar({ children }: PropsWithChildren<AppContainerProps>): JSX.Element {
  return (
    <div className="n-container-with-sidebar">
      <Sidebar>
        <SidebarItems links={DefaultSidebarLinks} />
      </Sidebar>
      <Content>{children}</Content>
    </div>
  );
}

function Content({ children }: { children: ReactNode }): JSX.Element {
  return <div className="n-content">{children}</div>;
}

function Sidebar({ children }: { children: ReactNode }): JSX.Element {
  return <div className="n-sidebar">{children}</div>;
}

function SidebarItems({ links }: { links: Array<SidebarLink> }): JSX.Element {
  const pathname = usePathname();

  return (
    <ul className="n-sidebar-list">
      {links.map((link) => (
        <li key={link.path} className={pathname === link.path ? 'active' : ''}>
          <Link href={link.path} className="n-sidebar-link">
            {link.icon && <span className="n-sidebar-icon">{link.icon}</span>}
            <span className="n-sidebar-text">{link.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

ContainerWithSidebar.Content = Content;
ContainerWithSidebar.Sidebar = Sidebar;
Sidebar.Items = SidebarItems;

