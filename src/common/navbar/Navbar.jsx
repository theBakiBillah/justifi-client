import {
    memo,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { BsBoxArrowRight, BsGrid3X3Gap, BsList } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import { Link, NavLink } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../../providers/AuthProviders";
import useUserData from "../../hooks/useUserData";

const SERVICES = [
    { name: "Arbitration", path: "/arbitration-process" },
    { name: "Mediation", path: "/mediation-process" },
];

const Attorneys = [
    { name: "Arbitrators", path: "/arbitrators" },
    { name: "Mediators", path: "/mediators" },
    { name: "Lawyers", path: "/lawyers" },
];

const NAV_LINKS = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    // { name: "Forum", path: "/forum", authOnly: true },
    { name: "Blog", path: "/blog" },
];

const NavItem = ({ children, to, className = "" }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                isActive
                    ? "text-white bg-stone-500 font-semibold shadow-md"
                    : "text-gray-200 hover:text-white hover:bg-gray-700"
            } ${className}`
        }
    >
        {children}
    </NavLink>
);

const DropdownItem = ({ children, to, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm transition-all ${
                isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
            } first:rounded-t-lg last:rounded-b-lg`
        }
        role="menuitem"
    >
        {children}
    </NavLink>
);

const Dropdown = ({ items, title }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const timeoutRef = useRef(null);

    const toggle = useCallback((e) => {
        e?.stopPropagation();
        setIsOpen((prev) => !prev);
    }, []);

    const openDropdown = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setIsOpen(true);
    }, []);

    const closeDropdown = useCallback(() => {
        timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
    }, []);

    useEffect(() => {
        const handleEsc = (e) => e.key === "Escape" && closeDropdown();
        const handleClickOutside = (e) => {
            if (
                isOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                closeDropdown();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.removeEventListener("click", handleClickOutside);
            clearTimeout(timeoutRef.current);
        };
    }, [isOpen, closeDropdown]);

    return (
        <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
        >
            <button
                onClick={toggle}
                onMouseEnter={openDropdown}
                className={`flex items-center gap-1 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                    isOpen
                        ? "text-white bg-primary shadow-md"
                        : "text-gray-200 hover:text-white hover:bg-gray-700"
                }`}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {title}
                <IoMdArrowDropdown
                    className={`transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <ul
                    className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2"
                    role="menu"
                    onMouseEnter={openDropdown}
                    onMouseLeave={closeDropdown}
                >
                    {items.map((item) => (
                        <li key={item.path} role="none">
                            <DropdownItem
                                to={item.path}
                                onClick={closeDropdown}
                            >
                                {item.name}
                            </DropdownItem>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const ServicesDropdown = () => <Dropdown items={SERVICES} title="Services" />;
const AttorneysDropdown = () => (
    <Dropdown items={Attorneys} title="Attorneys" />
);

const UserDropdown = memo(({ user, onLogout }) => {
    const { userRole } = useUserData();
    const userPhoto =
        user.photoURL ||
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

    return (
        <div className="dropdown dropdown-end">
            <label
                tabIndex={0}
                className="btn btn-ghost btn-circle avatar group relative"
            >
                <div className="w-10 rounded-full ring-2 ring-white ring-offset-2 ring-offset-gray-800 transition-all duration-300 group-hover:ring-primary">
                    <img
                        src={userPhoto}
                        alt="User Avatar"
                        className="object-cover"
                    />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-gray-800"></div>
            </label>
            <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 p-2 shadow-xl bg-white rounded-box w-64 space-y-1 border border-gray-200 z-50"
            >
                <li className="px-4 py-3 border-b border-gray-200 bg-gray-800 text-white rounded-t-lg">
                    <div className="flex items-center space-x-3">
                        <div className="avatar">
                            <div className="w-12 rounded-full ring-2 ring-white">
                                <img src={userPhoto} alt="User Avatar" />
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold truncate">
                                {user.displayName || "User"}
                            </p>
                            <p className="text-xs text-gray-300">
                                {user.email || "Welcome back!"}
                            </p>
                        </div>
                    </div>
                </li>
                <li className="px-2">
                    <Link
                        to={userRole === "admin" ? "/admin" : "/dashboard"}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors mt-2"
                    >
                        <BsGrid3X3Gap className="w-4 h-4 mr-3 text-primary" />
                        Dashboard
                    </Link>
                </li>
                <li className="px-2 pt-2 border-t border-gray-200">
                    <button
                        onClick={onLogout}
                        className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                    >
                        <BsBoxArrowRight className="w-4 h-4 mr-3" />
                        Log Out
                    </button>
                </li>
            </ul>
        </div>
    );
});

const GuestActions = memo(() => (
    <div className="flex space-x-3">
        <Link
            to="/login"
            className="px-5 py-2.5 rounded-lg bg-white text-gray-800 font-semibold hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg"
        >
            Login
        </Link>
    </div>
));

const Navbar = () => {
    const { user, signOutUser } = useContext(AuthContext);

    const handleLogout = useCallback(() => {
        signOutUser()
            .then(() => {
                Swal.fire({
                    title: "Logged out!",
                    text: "You've been successfully logged out.",
                    icon: "success",
                    background: "#ffffff",
                    color: "#000000",
                    confirmButtonColor: "#4f46e5",
                });
            })
            .catch((error) => {
                Swal.fire({
                    title: "Error",
                    text: error.message,
                    icon: "error",
                    background: "#ffffff",
                    color: "#000000",
                    confirmButtonColor: "#4f46e5",
                });
            });
    }, [signOutUser]);

    const filteredLinks = NAV_LINKS.filter((link) => !link.authOnly || user);

    return (
        <section className="bg-gray-900 backdrop-blur-md sticky top-0 z-50 border-b border-gray-700 shadow-lg">
            <div className="navbar container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Logo & Mobile Menu */}
                <div className="navbar-start">
                    {/* Mobile Hamburger Menu */}
                    <div className="dropdown lg:hidden">
                        <label
                            tabIndex={0}
                            className="btn btn-ghost hover:bg-gray-700 text-white"
                        >
                            <BsList className="h-6 w-6" />
                        </label>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-3 p-2 shadow-xl bg-gray-800 rounded-box w-64 space-y-1 border border-gray-700"
                        >
                            {filteredLinks.map((link) => (
                                <li key={link.path}>
                                    <NavItem
                                        to={link.path}
                                        className="text-white"
                                    >
                                        {link.name}
                                    </NavItem>
                                </li>
                            ))}
                            <li>
                                <ServicesDropdown />
                            </li>
                            <li>
                                <AttorneysDropdown />
                            </li>
                        </ul>
                    </div>

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <h1 className="text-2xl font-bold text-white">
                            Justifi<span className="text-primary">.</span>
                        </h1>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="navbar-center hidden lg:flex">
                    <ul className="flex items-center space-x-1">
                        {filteredLinks.map((link) => (
                            <li key={link.path}>
                                <NavItem to={link.path}>{link.name}</NavItem>
                            </li>
                        ))}
                        <li>
                            <ServicesDropdown />
                        </li>
                        <li>
                            <AttorneysDropdown />
                        </li>
                    </ul>
                </div>

                {/* User/Auth Actions */}
                <div className="navbar-end space-x-4">
                    {user ? (
                        <UserDropdown user={user} onLogout={handleLogout} />
                    ) : (
                        <GuestActions />
                    )}
                </div>
            </div>
        </section>
    );
};

export default Navbar;
