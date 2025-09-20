import { MdAccountBox } from "react-icons/md";
import { Inertia } from '@inertiajs/inertia';

const AccountButton = () => {
    return (
        <button
            onClick={() => Inertia.get('/profile')}
            className="w-10 h-10 mt-1 text-black hover:text-black hover:scale-110 dark:text-slate-300 dark:hover:text-white transition-transform duration-500"
        >
            <MdAccountBox className="w-full h-full" />
        </button>
    );
};

export default AccountButton;
