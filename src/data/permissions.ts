import type { AdminRole, MenuPermission, Permission, RolePermissions } from '../types/parking';
export type { Permission } from '../types/parking';

export const ROLES: AdminRole[] = ['Super Admin', 'Admin', 'Operator', 'Viewer'];
export const MENU_ACTIONS: {
  menu: MenuPermission;
  label: string;
  actions: { key: Permission; label: string }[];
}[] = [
  { menu: 'dashboard', label: 'Dashboard', actions: [] },
  {
    menu: 'parking-layout',
    label: 'Parking Layout',
    actions: [
      { key: 'add-spots', label: 'เพิ่มช่องจอด' },
      { key: 'edit-spots', label: 'แก้ไขช่องจอด' },
      { key: 'manage-floors', label: 'จัดการชั้น' },
    ],
  },
  {
    menu: 'operations',
    label: 'Operation',
    actions: [
      { key: 'view-photos', label: 'ดูรูปเข้า–ออก' },
      { key: 'edit-operations', label: 'แก้ไขรายการ' },
      { key: 'export-operations', label: 'ส่งออกรายการ' },
    ],
  },
  {
    menu: 'reports',
    label: 'Reports',
    actions: [{ key: 'export-reports', label: 'ส่งออกรายงาน' }],
  },
  {
    menu: 'permissions',
    label: 'Admin Perm',
    actions: [
      { key: 'edit-users', label: 'จัดการบัญชี' },
      { key: 'edit-roles', label: 'ตั้งค่าสิทธิ์' },
    ],
  },
];
export const ALL_PERMISSIONS: Permission[] = [
  ...MENU_ACTIONS.flatMap((item) => [item.menu, ...item.actions.map((a) => a.key)]),
  'reset',
];
export const PERMISSIONS: RolePermissions = {
  'Super Admin': [...ALL_PERMISSIONS],
  Admin: [
    'dashboard',
    'parking-layout',
    'operations',
    'reports',
    'add-spots',
    'edit-spots',
    'view-photos',
    'export-operations',
    'export-reports',
  ],
  Operator: ['dashboard', 'parking-layout', 'operations', 'add-spots', 'edit-spots', 'view-photos'],
  Viewer: ['dashboard', 'reports'],
};

export function hasPermission(
  role: AdminRole | undefined,
  permission: Permission,
  grants: RolePermissions = PERMISSIONS,
) {
  if (!role) return false;
  const parent = MENU_ACTIONS.find((item) =>
    item.actions.some((action) => action.key === permission),
  );
  return grants[role].includes(permission) && (!parent || grants[role].includes(parent.menu));
}

export function firstAllowedPath(role: AdminRole, grants: RolePermissions) {
  return `/admin/${MENU_ACTIONS.find((item) => hasPermission(role, item.menu, grants))?.menu ?? 'dashboard'}`;
}
