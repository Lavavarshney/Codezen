// frontend/src/components/Navbar.jsx
import { useState } from "react";
import { close, logo, menu } from "../assets";
import { navLinks } from "../constants";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [active, setActive] = useState("Home");
  const [toggle, setToggle] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  return (
    <nav className="w-full flex py-6 justify-between items-center navbar">
      <img src={logo} alt="hoobank" className="w-[124px] h-[32px]" />

      <ul className="list-none sm:flex hidden justify-end items-center flex-1">
        {navLinks.map((nav, index) => (
          <li
            key={nav.id}
            className={`relative font-poppins font-normal cursor-pointer text-[16px] ${
              active === nav.title ? "text-white" : "text-dimWhite"
            } ${index === navLinks.length - 1 ? "mr-0" : "mr-10"}`}
            onClick={() => setActive(nav.title)}
            onMouseEnter={() => nav.id === "Options" && setDropdown(true)}
            onMouseLeave={() => nav.id === "Options" && setDropdown(false)}
          >
            {nav.id === "Options" ? (
              <>
                <span>{nav.title}</span>
                {dropdown && (
                  <ul className="absolute top-full left-0 mt-2 bg-gray-800 p-2 rounded-lg shadow-lg">
                    <li className="text-white px-4 py-2 hover:bg-gray-700 cursor-pointer">
                      <Link to="/dashboard/stocks">Stocks</Link>
                    </li>
                    <li className="text-white px-4 py-2 hover:bg-gray-700 cursor-pointer">
                      <Link to="/dashboard/mutual-funds">Mutual Funds</Link>
                    </li>
                    <li className="text-white px-4 py-2 hover:bg-gray-700 cursor-pointer">
                      <Link to="/dashboard/crypto">Crypto</Link>
                    </li>
                  </ul>
                )}
              </>
            ) : (
              <Link to={`#${nav.id}`}>{nav.title}</Link>
            )}
          </li>
        ))}
      </ul>

      {/* Mobile Menu */}
      <div className="sm:hidden flex flex-1 justify-end items-center">
        <img
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain"
          onClick={() => setToggle(!toggle)}
        />
        <div
          className={`${
            !toggle ? "hidden" : "flex"
          } p-6 bg-black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar`}
        >
          <ul className="list-none flex justify-end items-start flex-1 flex-col">
            {navLinks.map((nav, index) => (
              <li
                key={nav.id}
                className={`relative font-poppins font-medium cursor-pointer text-[16px] ${
                  active === nav.title ? "text-white" : "text-dimWhite"
                } ${index === navLinks.length - 1 ? "mb-0" : "mb-4"}`}
                onClick={() => setActive(nav.title)}
                onMouseEnter={() => nav.id === "Options" && setDropdown(true)}
                onMouseLeave={() => nav.id === "Options" && setDropdown(false)}
              >
                {nav.id === "Options" ? (
                  <>
                    <span>{nav.title}</span>
                    {dropdown && (
                      <ul className="mt-2 bg-gray-800 p-2 rounded-lg shadow-lg">
                        <li className="text-white px-4 py-2 hover:bg-gray-700 cursor-pointer">
                          <Link to="/dashboard/stocks">Stocks</Link>
                        </li>
                        <li className="text-white px-4 py-2 hover:bg-gray-700 cursor-pointer">
                          <Link to="/dashboard/mutual-funds">Mutual Funds</Link>
                        </li>
                        <li className="text-white px-4 py-2 hover:bg-gray-700 cursor-pointer">
                          <Link to="/dashboard/crypto">Crypto</Link>
                        </li>
                      </ul>
                    )}
                  </>
                ) : (
                  <Link to={`#${nav.id}`}>{nav.title}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;