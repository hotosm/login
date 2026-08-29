interface SpinnerProps {
  /** `page` fills the space a whole panel would take, `inline` a section of one. */
  size?: 'page' | 'inline';
}

/** Centred loading indicator. */
function Spinner({ size = 'page' }: SpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center ${size === 'page' ? 'py-24' : 'py-12'}`}
    >
      <div
        className={`animate-spin rounded-full border-4 border-hot-red-600 border-t-transparent ${
          size === 'page' ? 'h-12 w-12' : 'h-8 w-8'
        }`}
      />
    </div>
  );
}

export default Spinner;
