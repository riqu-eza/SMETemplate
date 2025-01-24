/* eslint-disable react/prop-types */

const ProductList = ({ products, setEditingItem }) => {
  return (
    <div>
      <h2>Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product._id}>
            {product.name} - ${product.price}
            <button onClick={() => setEditingItem(product)}>Edit</button>
          </li>
        ))}
      </ul>
      <button onClick={() => setEditingItem({ type: 'product' })}>Add Product</button>
    </div>
  );
};

export default ProductList;
