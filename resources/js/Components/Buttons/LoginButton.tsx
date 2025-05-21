import { CiLogin } from "react-icons/ci";
import { Link } from '@inertiajs/react';
import { IoLogInOutline } from "react-icons/io5";
import { IoLogIn } from "react-icons/io5";

const LoginButton = () => {
    return (
        <Link
            href="/login"
            className="w-9 h-9  text-sm font-small text-black hover:text-black hover:scale-110 dark:text-slate-300 dark:hover:text-white transition-transform duration-500"
        >
            <IoLogIn className="w-full h-full mt-[2px] -ml-1" />
        </Link>
    );
};

export default LoginButton;
