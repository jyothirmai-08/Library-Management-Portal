export default function Message({
  children,
  type = "info"
}) {
  if (!children) return null;

  return (
    <p className={`message ${type}`} role="status">
      {children}
    </p>
  );
}