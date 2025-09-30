import { FC } from "react";
import Modal from "@/Components/Modal/Modal";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import { useUser } from "@/Contexts/User/UserContext";
import { router, usePage } from "@inertiajs/react";

interface LogoutProps {
  show: boolean;
  onClose: () => void;
}

const Logout: FC<LogoutProps> = ({ show, onClose }) => {
  const { setUser } = useUser();
  const { props, url } = usePage<{ auth?: { user?: any } }>(); // get current URL

  const confirmLogout = async () => {
    onClose();
    try {
      router.post(
        "/logout",
        { redirect: url }, // pass current URL to backend
        {
          onSuccess: (page) => {
            const guest = page.props.auth.user;
            setUser(guest);

            // stay on current page
            router.visit(url, { preserveState: true, preserveScroll: true });
          },
          onError: (err) => console.error("Logout error:", err),
        }
      );
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-4 space-y-4 text-center max-w-lg w-full mx-auto">
        <h2 className="text-2xl font-semibold">Are you sure you want to logout?</h2>
        <div className="flex justify-center gap-4 mt-6">
          <PrimaryButton className="p-2 px-6" onClick={confirmLogout}>
            Log out
          </PrimaryButton>
          <SecondaryButton className="p-2 px-6" onClick={onClose}>
            Cancel
          </SecondaryButton>
        </div>
      </div>
    </Modal>
  );
};

export default Logout;
