interface ErrorBannerProps {
  children: React.ReactNode;
}

/** Full-width error message, used where a load failure replaces the content. */
function ErrorBanner({ children }: ErrorBannerProps) {
  return (
    <div className="bg-hot-red-50 border border-hot-red-200 text-hot-red-700 px-4 py-3 rounded-lg">
      {children}
    </div>
  );
}

export default ErrorBanner;
