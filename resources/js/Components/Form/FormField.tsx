import InputLabel from '@/Components/Login/InputLabel';
import TextInput from '@/Components/Login/TextInput';
import InputError from '@/Components/Login/InputError';

export default function FormField({
    id,
    label,
    type = 'text',
    value,
    onChange,
    autoComplete,
    required = false,
    error,
    className = '',
    isPassword = false,
    showPassword = false,  // Add showPassword prop
    onTogglePasswordVisibility,  // Add onTogglePasswordVisibility prop
}: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autoComplete?: string;
    required?: boolean;
    error?: string;
    isPassword?: boolean;
    showPassword?: boolean;
    onTogglePasswordVisibility?: () => void;
    className?: string;
}) {
    return (
        <div className={`mt-2 ${className}`}>
            <InputLabel htmlFor={id} value={label} />
            <TextInput
                id={id}
                type={isPassword && !showPassword ? 'password' : 'text'}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                required={required}
                className="mt-1 block w-full transition duration-150 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                isPasswordField={isPassword}
                showPassword={showPassword}
                onTogglePasswordVisibility={onTogglePasswordVisibility}
            />
            <InputError message={error} className="mt-2" />
        </div>
    );
}
