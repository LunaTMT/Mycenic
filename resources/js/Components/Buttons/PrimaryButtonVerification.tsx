import { ButtonHTMLAttributes } from 'react';

declare var grecaptcha: {
  enterprise: {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
  };
};

export default function PrimaryButton({
  type = 'button',
  className = '',
  disabled,
  children,
  onSubmit,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const handleRecaptcha = (e: React.FormEvent) => {
    e.preventDefault();
    grecaptcha.enterprise.ready(async () => {
      const token = await grecaptcha.enterprise.execute('6LeKoiUrAAAAAFydC_J98zEjqS3dvz8PSHueQPLP', { action: 'submit' });
      // Set the reCAPTCHA token to the form or handle it as needed.
      if (onSubmit) {
        onSubmit(token); // Pass the token to the onSubmit callback, if provided
      }
    });
  };

  return (
    <button
      {...props}
      className={`
        font-medium py-3 px-8 rounded-full 
        transform 
        font-Poppins text-white 
        text-center flex justify-center items-center
        bg-yellow-500
        dark:bg-[#7289da]
        ${!disabled ? 'hover:scale-[103%] transition-all duration-300 hover:shadow-[0_0_3px_#FFD700,0_0_8px_#FFD700,0_0_15px_#FFD700] dark:hover:shadow-[0_0_5px_#93c5fd,0_0_12px_#60a5fa,0_0_20px_#2563eb]' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
        ${className}`}
      disabled={disabled}
      data-sitekey="6LeKoiUrAAAAAFydC_J98zEjqS3dvz8PSHueQPLP"
      data-callback="onSubmit"
      data-action="submit"
      onClick={handleRecaptcha} // Handle reCAPTCHA click
    >
      {children}
    </button>
  );
}
