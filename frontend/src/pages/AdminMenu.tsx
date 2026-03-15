import AppShell from "@/components/layout/AppShell";
import MenuManagementPanel from "@/components/admin/MenuManagementPanel";

const AdminMenu = () => {
  return (
    <AppShell title="Admin Menu Management">
      <MenuManagementPanel />
    </AppShell>
  );
};

export default AdminMenu;