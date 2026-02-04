export default function MenuItemCard({ item, onAdd }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12, marginBottom: 10 }}>
      <h4>{item.name}</h4>
      <p>Price: ${item.price}</p>

      <button onClick={() => onAdd(item)}>
        Add to Cart
      </button>
    </div>
  );
}
