const ToggleSwitch = ({ isActive, isBusy, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={isActive}
    disabled={isBusy}
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
      isActive ? "bg-green-500" : "bg-foreground/20"
    }`}
  >
    <span
      className={`inline-block h-4.5 w-4.5 h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
        isActive ? "translate-x-[22px]" : "translate-x-1"
      }`}
    />
  </button>
);

export default ToggleSwitch;