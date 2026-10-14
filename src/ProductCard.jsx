export default function ProductCard({ product, highlighted }) {
  return (
    <div className={`card ${highlighted ? "card--highlight" : ""}`}>
      <span className="card__tag">{product.category}</span>
      <h3>{product.name}</h3>
      <p className="card__desc">{product.description}</p>
      <p className="card__price">${product.price}</p>
    </div>
  );
}
