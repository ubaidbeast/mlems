import Image from "next/image";
import Link from "next/link";

export function HeaderLogo() {
  return (
    <Link href='/'>
        <div className="items-center hidden lg:flex">
            <Image src='/logo.svg' alt="logo" height={32} width={32} />
            <p className="font-semibold text-white text-2xl ml-2.5">
                Expense Managment
            </p>
        </div>
    </Link>
  )
}
