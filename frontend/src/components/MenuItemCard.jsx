export default function MenuItemCard({ item, onAdd }) {
  return (
    <div className="menu-item-card">
      <div className="menu-item-image-container">
        <img
          src={item.image || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={item.name}
          className="menu-item-image"
        />
        {item.is_vegetarian === 1 && (
          <span className="vegetarian-badge">🌱 Vegetarian</span>
        )}
      </div>

      <div className="menu-item-info">
        <h3 className="menu-item-name">{item.name}</h3>
        {item.description && (
          <p className="menu-item-description">{item.description}</p>
        )}

        <div className="menu-item-footer">
          <span className="menu-item-price">${Number(item.price).toFixed(2)}</span>

          {item.is_available !== 0 ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onAdd(item)}
            >
              Add to Cart
            </button>
          ) : (
            <span className="unavailable-badge">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}
