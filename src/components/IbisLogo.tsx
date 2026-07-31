'use client';

interface IbisLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'dark' | 'light' | 'print';
}

export default function IbisLogo({
  size = 'lg',
  showText = true,
  className = '',
  variant = 'dark',
}: IbisLogoProps) {
  const sizeMap = {
    sm: { box: 'w-8 h-8', title: 'text-xs' },
    md: { box: 'w-10 h-10', title: 'text-sm' },
    lg: { box: 'w-12 h-12', title: 'text-lg md:text-xl' },
    xl: { box: 'w-14 h-14', title: 'text-xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={`relative flex-shrink-0 ${currentSize.box} rounded-xl overflow-hidden shadow-lg flex items-center justify-center ${
        variant === 'print'
          ? 'bg-black border border-slate-700'
          : 'bg-[#000000] border border-white/20'
      } p-1`}>
        <img
          src="/logo.png"
          alt="IBIS RICE CONSERVATION CO., LTD."
          className="w-full h-full object-contain rounded-lg"
          loading="eager"
        />
      </div>

      {showText && (
        <div>
          <h1 className={`font-extrabold tracking-tight ${currentSize.title} ${
            variant === 'print'
              ? 'text-slate-900'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-[#34d399]'
          }`}>
            IBIS RICE CONSERVATION CO., LTD
          </h1>
          <p className={`text-xs mt-0.5 ${
            variant === 'print' ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Integrated Paddy Operations · Role-Based Workflow Portal
          </p>
        </div>
      )}
    </div>
  );
}
