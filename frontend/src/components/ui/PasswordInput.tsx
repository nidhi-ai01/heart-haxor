'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from './Input';
import clsx from 'clsx';

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type" | "rightIcon">;

export default function PasswordInput(props: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={clsx(
            "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200",
            "focus:outline-none focus:text-violet-600 dark:focus:text-violet-400",
            "transition-colors pointer-events-auto p-1 rounded-full",
            "hover:bg-gray-100 dark:hover:bg-slate-800"
          )}
          aria-label="Toggle password visibility"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      }
    />
  );
}
