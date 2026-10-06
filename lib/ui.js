/* Shared button/input class strings (Tailwind) */

export const BTN_PRIMARY =
  'flex min-h-[62px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-blood px-6 py-4 text-center text-lg font-semibold text-bloodink ' +
  'shadow-[0_5px_0_var(--color-bloodshade)] transition hover:-translate-y-0.5 hover:shadow-[0_7px_0_var(--color-bloodshade)] ' +
  'active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-bloodshade)] ' +
  'disabled:pointer-events-none disabled:bg-panel2 disabled:text-dust disabled:shadow-none';

export const BTN_GHOST =
  'flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-[14px] border-2 border-blood bg-transparent px-6 py-3.5 ' +
  'text-center text-base font-semibold text-blood transition hover:bg-blood/10 active:translate-y-0.5';

export const INPUT =
  'min-h-[60px] w-full rounded-[14px] border-[1.5px] border-edge bg-panel px-5 py-3.5 text-[1.15rem] font-medium text-cream outline-none transition ' +
  'placeholder:text-[#7A5560] focus:border-blood focus:ring-4 focus:ring-blood/15';
