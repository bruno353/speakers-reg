/* eslint-disable no-unused-vars */
"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import { usePathname } from "next/navigation";
import {
  useWeb3ModalTheme,
  Web3NetworkSwitch,
  Web3Button,
} from "@web3modal/react";
import { useNetwork, useAccount } from "wagmi";

const Header = () => {
  const { address } = useAccount();
  const { chain, chains } = useNetwork();
  const pathname = usePathname();
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [isChainWrong, setIsChainWrong] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };
  const { theme, setTheme } = useWeb3ModalTheme();

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  // Este useEffect está travando a aplicação, econtrar maneira de tratar isto.
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    if (chain && chain.name !== "Polygon Mumbai") {
      setIsChainWrong(true);
      setTheme({
        themeMode: "dark",
        themeVariables: {
          "--w3m-accent-color": `${isChainWrong ? "#bf0d0d" : ""}`,
          // ...
        },
      });
    } else {
      setIsChainWrong(false);
      setTheme({
        themeVariables: {
          "--w3m-accent-color": "#000000",
          // ...
        },
      });
    }
  }, [chain, isChainWrong, setTheme, address]);

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <>
      <header className={`header flex w-full items-center bg-[#F9F9F9]`}>
        <div className="container w-full px-0">
          <div className="relative  flex items-center  text-black">
            <div className="">
              <Link
                href="/"
                className={`header-logo mr-[60px] block w-full py-8 `}
              >
                <img
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/header/l3a.svg`}
                  alt="image"
                  className={`ml-5 w-[100px]`}
                />
              </Link>
            </div>
            <div className="flex w-full items-center justify-between">
              <div>
                <nav
                  id="navbarCollapse"
                  className={`navbar absolute right-0 z-30 mr-[95px] w-[250px] rounded border-[.5px] border-body-color/50 bg-white py-4 px-6 duration-300 dark:border-body-color/20 dark:bg-dark lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 ${
                    navbarOpen
                      ? "visibility top-full opacity-100"
                      : "invisible top-[120%] opacity-0"
                  }`}
                >
                  <ul className="block lg:flex lg:space-x-[60px]">
                    {menuData.map((menuItem, index) => (
                      <li key={menuItem.id} className="group relative">
                        {menuItem.path ? (
                          menuItem.title === "Profile" && !address ? null : (
                            <a
                              href={
                                menuItem.title === "Profile"
                                  ? `/profile/${address}`
                                  : menuItem.path
                              }
                              target={menuItem.newTab ? "_blank" : ""}
                              rel={menuItem.newTab ? "noopener noreferrer" : ""}
                              className={`flex py-2 text-[16px] font-medium text-[#000000] group-hover:opacity-70 lg:mr-0 lg:inline-flex lg:py-6 lg:px-0 ${
                                pathname.includes(menuItem.path)
                                  ? "font-bold"
                                  : ""
                              }`}
                            >
                              {menuItem.title}
                            </a>
                          )
                        ) : (
                          <>
                            <a
                              onClick={() => handleSubmenu(index)}
                              className="flex cursor-pointer items-center justify-between py-2 text-base text-dark group-hover:opacity-70 lg:mr-0 lg:inline-flex lg:py-6 lg:px-0"
                            >
                              {menuItem.title}
                              <span className="pl-3">
                                <svg width="15" height="14" viewBox="0 0 15 14">
                                  <path
                                    d="M7.81602 9.97495C7.68477 9.97495 7.57539 9.9312 7.46602 9.8437L2.43477 4.89995C2.23789 4.70308 2.23789 4.39683 2.43477 4.19995C2.63164 4.00308 2.93789 4.00308 3.13477 4.19995L7.81602 8.77183L12.4973 4.1562C12.6941 3.95933 13.0004 3.95933 13.1973 4.1562C13.3941 4.35308 13.3941 4.65933 13.1973 4.8562L8.16601 9.79995C8.05664 9.90933 7.94727 9.97495 7.81602 9.97495Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </a>
                            <div
                              className={`submenu relative top-full left-0 rounded-md bg-white transition-[top] duration-300 group-hover:opacity-100 dark:bg-dark lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${
                                openIndex === index ? "block" : "hidden"
                              }`}
                            >
                              {menuItem.submenu.map((submenuItem) => (
                                <Link
                                  href={submenuItem.path}
                                  key={submenuItem.id}
                                  className="block rounded py-2.5 text-sm text-dark hover:opacity-70 lg:px-3"
                                >
                                  {submenuItem.title}
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
