import Link from 'next/link'; // Use Next.js Link for navigation
// Make sure to create a corresponding CSS file for styling

const NavbarFoodbank = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link href="/">Foodbank</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/services">Services</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarFoodbank;
