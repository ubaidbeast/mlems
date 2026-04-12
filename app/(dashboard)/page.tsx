import { DataCharts } from "@/components/data-charts";
import { DataGrid } from "@/components/data-grid";
import { NoDepartmentBanner } from "@/components/no-department-banner";
import { getCurrentUserAuthInfo } from "@/lib/get-user-department";

export default async function DashboardPage() {
  const { role, department } = await getCurrentUserAuthInfo();

  const isNonAdminWithNoDepartment = role !== "admin" && !department;

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      {isNonAdminWithNoDepartment ? (
        <NoDepartmentBanner />
      ) : (
        <>
          <DataGrid />
          <DataCharts />
        </>
      )}
    </div>
  );
}
