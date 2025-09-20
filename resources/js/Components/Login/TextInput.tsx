import { forwardRef, InputHTMLAttributes, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
  {
    type = 'text',
    className = '',
    disabled = false,
    ...props
  }: InputHTMLAttributes<HTMLInputElement> & { disabled?: boolean },
  ref,
) {
  const localRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  return (
    <div className="relative">
      <input
        {...props}
        ref={localRef}
        type={type}
        disabled={disabled}
        className={`
          w-full
          rounded-md
          border border-black/20 dark:border-white/20
          shadow-2xl
          p-2 pl-3
        bg-white dark:bg-[#1e2124]/60
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none
          focus:ring-2
          focus:ring-yellow-500 dark:focus:ring-[#7289da]
          ${className}
        `}
      />
    </div>
  );
});
