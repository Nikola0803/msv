import { useState } from 'react';
import { useAgeGate } from '../../hooks/useAgeGate';

export default function AgeGate() {
  const { isConfirmed, confirm, exit } = useAgeGate();
  const [checked, setChecked] = useState(false);

  if (isConfirmed === null || isConfirmed === true) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="agegate-title">
      <div className="relative w-full max-w-md bg-[#E1E4D9] border border-[#DBD0C2] p-8 md:p-10 shadow-2xl rounded-[2px]">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-[#B08D57] flex items-center justify-center bg-[#2F3430]">
            <span className="font-heading text-xl text-[#B08D57] tracking-[0.15em] font-semibold">
              MSV
            </span>
          </div>
        </div>

        <h2 id="agegate-title" className="font-heading text-center text-lg tracking-[0.15em] uppercase text-[#2F3430] mb-2 font-light">
          Age Verification
        </h2>

        <div className="flex justify-center mb-5">
          <span className="text-[#B08D57] text-lg font-heading italic">✦</span>
        </div>

        <p className="font-sans text-sm text-center text-[#2F3430] leading-relaxed mb-6 font-light">
          You must be at least <strong className="font-medium">21 years of age</strong> to enter
          this website. All products are sold strictly for{' '}
          <strong className="font-medium">laboratory research use only</strong> and are not for
          human consumption.
        </p>

        <div className="flex flex-col gap-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 w-4 h-4 accent-[#B08D57]" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            <span className="font-sans text-xs text-[#3D4E3D] leading-relaxed font-light">
              I confirm that I am 21 years of age or older and that all products purchased will be
              used for lawful research purposes only.
            </span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={confirm}
            disabled={!checked}
            className={`flex-1 text-[#E1E4D9] font-sans text-xs tracking-[0.14em] uppercase py-3 px-6 rounded-[2px] transition-colors font-medium ${!checked ? 'bg-[#B08D57] opacity-50 cursor-not-allowed' : 'bg-[#B08D57] hover:bg-[#9a7849]'}`}
          >
            I Confirm
          </button>
          <button
            onClick={exit}
            className="flex-1 bg-transparent text-[#3D4E3D] hover:text-[#2F3430] font-sans text-xs tracking-[0.14em] uppercase py-3 px-6 border border-[#DBD0C2] hover:border-[#2F3430] rounded-[2px] transition-colors font-normal"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}