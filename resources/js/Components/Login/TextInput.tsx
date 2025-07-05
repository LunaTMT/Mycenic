import { forwardRef, InputHTMLAttributes, useImperativeHandle, useRef, useState } from 'react';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa'; // Import FaLock icon

export default forwardRef(function TextInput(
  {
    type = 'text',
    className = '',
    isPasswordField = false,
    showPassword = false,
    onTogglePasswordVisibility,
    disabled = false, // Add a disabled prop to check
    ...props
  }: InputHTMLAttributes<HTMLInputElement> & { isPasswordField?: boolean; showPassword?: boolean; onTogglePasswordVisibility?: () => void; disabled?: boolean },
  ref,
) {
  const [inputType, setInputType] = useState(isPasswordField && showPassword ? 'text' : 'password');
  const localRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  // Update input type when the visibility state changes
  const handleTogglePasswordVisibility = () => {
    if (onTogglePasswordVisibility) {
      onTogglePasswordVisibility();
    }
    setInputType((prevType) => (prevType === 'password' ? 'text' : 'password'));
  };

  return (
    <div className="relative">
      <input
        {...props}
        ref={localRef}
        type={isPasswordField ? inputType : type} // Dynamically set the type
        className={`rounded-md border-1 border-gray-400 shadow-2xl p-[6px] pl-2 dark:text-white ${className}`}
        disabled={disabled} // Pass disabled to the input element
      />
      {isPasswordField && onTogglePasswordVisibility && (
        <div
          onClick={handleTogglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
        >
          {showPassword ? (
            <FaEyeSlash size={20} color="gray" />
          ) : (
            <FaEye size={20} color="gray" />
          )}
        </div>
      )}

      {/* Show lock icon when the input is disabled */}
      {disabled && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <FaLock size={20} />
        </div>
      )}
    </div>
  );
});
