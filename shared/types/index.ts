// Export centralisé de tous les types
export * from './common';
export * from './patient';
export * from './user';
export * from './medical';
export * from './antecedents';
export * from './statistics';
export * from './props';

export interface SideBarMenuItem {
  key: string;
  label: string;
  icon: React.ElementType;
  color?: string;
  hasSubMenu?: boolean;
}

export interface SideBarDMProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isDrawer?: boolean;
  menuItems?: SideBarMenuItem[];
}