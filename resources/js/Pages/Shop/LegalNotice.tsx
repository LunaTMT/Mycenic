// resources/js/Components/Cart/LegalNotice.tsx
import React from 'react';
import { useCart } from '@/Contexts/Shop/Cart/CartContext';
import { router } from '@inertiajs/react';

interface LegalNoticeProps {
  agreed: boolean;
  onAgreeChange: (v: boolean) => void;
}

export default function LegalNotice({ agreed, onAgreeChange }: LegalNoticeProps) {
  const { hasPsyilocybinSporeSyringe } = useCart();
  const show = hasPsyilocybinSporeSyringe
  if (!show) return null;

  const handleContinue = () => {
    // If you still need this button to navigate somewhere:
    router.get(route('cart.get.shipping.details'));
  };

  return (
    <div className="w-full bg-red-100 border border-red-300 text-red-800 dark:bg-red-900 dark:border-red-600 dark:text-red-200 rounded-md p-4 mt-6">
      <p>
        ⚠️ <strong>Important Notice:</strong> In the UK, spore syringes are sold strictly for microscopy and educational purposes. Cultivation of psilocybin mushrooms is illegal under the Misuse of Drugs Act 1971.
      </p>
      <p className="mt-2">
        By clicking “Complete Checkout”, you agree to comply with UK law and confirm you’re purchasing for lawful purposes only.
      </p>

      <div className="mt-4 flex items-center">
        <input
          type="checkbox"
          id="legal-agreement"
          checked={agreed}
          onChange={e => onAgreeChange(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="legal-agreement">I agree to the terms above</label>
      </div>
    </div>
  );
}
