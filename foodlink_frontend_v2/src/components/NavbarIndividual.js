import Link from 'next/link'; // Use Next.js Link for navigation

const NavbarIndividual = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link href="/">FoodLink</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link href="/find-foodbank">Find Food Bank</Link>
        </li>
        <li>
          <Link href="/resources">Resources</Link>
        </li>
        <li>
          <Link href="/contact">Contact Us</Link>
        </li>
        <li>
          <Link href="/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarIndividual;
