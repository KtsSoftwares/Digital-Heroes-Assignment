export default function BS_Alert({ type, msg, onClose }) {
    return (
        <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
            {msg}
            <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
            />
        </div>
    );
}