// components/NavbarDonor.js
import Link from 'next/link'; // Use Next.js Link for navigation

const NavbarVolunteer = () => {
  return (
    <nav className="bg-yellow-500 p-4">
      <ul className="flex gap-4">
        <li>
          <Link href="/">Home</Link> {/* Replace <a> with <Link> */}
        </li>
        <li>
          <Link href="/donate">Donate</Link>
        </li>
        <li>
          <Link href="/my-donations">My Donations</Link>
        </li>
        <li>
          <Link href="/logout">Logout</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarVolunteer;
