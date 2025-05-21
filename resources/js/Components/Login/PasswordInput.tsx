// Path: src/Components/Login/PasswordInput.tsx

import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
  } from 'react';
  import { FaEye, FaEyeSlash } from 'react-icons/fa';
  
  export default forwardRef(function PasswordInput(
    {
      className = '',
      isFocused = false,
      ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
  ) {
    const localRef = useRef<HTMLInputElement>(null);
    const [show, setShow] = useState(false);
  
    useImperativeHandle(ref, () => ({
      focus: () => localRef.current?.focus(),
    }));
  
    useEffect(() => {
      if (isFocused) localRef.current?.focus();
    }, [isFocused]);
  
    // Toggle between password/text
    const actualType = props.type === 'password' ? (show ? 'text' : 'password') : props.type;
  
    return (
      <div className="relative">
        <input
          {...props}
          type={actualType}
          ref={localRef}
          className={`rounded-md border border-gray-400 shadow p-2 ${
            props.type === 'password' ? 'pr-10' : ''
          } ${className}`}
        />
        {props.type === 'password' && (
          <div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={() => setShow((v) => !v)}
          >
            {show ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </div>
        )}
      </div>
    );
  });
  