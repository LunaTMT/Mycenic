import { Transition } from '@headlessui/react';
import { InertiaLinkProps, Link } from '@inertiajs/react';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from 'react';

const DropDownContext = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  toggleOpen: () => void;
}>({
  open: false,
  setOpen: () => {},
  toggleOpen: () => {},
});

const Dropdown = ({
  children,
  onOpenChange,
}: PropsWithChildren<{ onOpenChange?: (open: boolean) => void }>) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  return (
    <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropDownContext.Provider>
  );
};

const Trigger = ({ children }: PropsWithChildren) => {
  const { setOpen } = useContext(DropDownContext);
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      // Absolute and inset-0 fills entire parent container (which must be relative and sized)
      className="inset-0 w-full h-full cursor-pointer"
    >
      {children}
    </div>
  );
};

const Content = ({
  align = 'right',
  width = 'fit',  // default changed to 'fit'
  contentClasses = '',
  children,
}: PropsWithChildren<{
  align?: 'left' | 'right';
  width?: '48' | 'fit';  // support for 'fit'
  contentClasses?: string;
}>) => {
  const { open, setOpen } = useContext(DropDownContext);

  let alignmentClasses = 'origin-top';
  if (align === 'left') {
    alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
  } else if (align === 'right') {
    alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
  }

  const widthClasses = width === '48' ? 'w-48' : width === 'fit' ? 'w-fit' : '';

  return (
    <Transition
      show={open}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`absolute mt-2 z-50 shadow-2xl  ${alignmentClasses} ${widthClasses}`}
      >
        <div className={`${contentClasses}`}>
          {children}
        </div>
      </div>
    </Transition>
  );
};

const DropdownLink = ({
  className = '',
  children,
  ...props
}: InertiaLinkProps) => (
  <Link
    {...props}
    className={
      'block w-full text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out focus:bg-gray-100 focus:outline-none ' +
      className
    }
  >
    {children}
  </Link>
);

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
