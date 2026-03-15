import AppShell from "@/components/layout/AppShell";
import PosInterface from "@/components/cashier/PosInterface";

const Pos = () => {
  return (
    <AppShell title="Cashier POS">
      <PosInterface />
    </AppShell>
  );
};

export default Pos;