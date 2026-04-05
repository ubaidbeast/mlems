import { Header } from "@/components/Header";
import { auth } from "@clerk/nextjs/server";

type Props= {
    children: React.ReactNode;
}

async function DashboardLayout({ children }: Props) {
  await auth.protect();

  return (
    <>        
          <Header />
          <main className="px-3 lg:px-14">
              {children}
          </main>
    </>
    
  )
}

export default DashboardLayout