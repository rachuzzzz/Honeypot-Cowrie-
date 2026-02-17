/**
 * Consistent page header component.
 * Provides uniform styling for page titles and descriptions.
 *
 * @param {string} title - Main page title
 * @param {string} description - Optional description text
 */
function PageHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-soc-text">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-soc-muted">
          {description}
        </p>
      )}
    </div>
  );
}

export default PageHeader;
