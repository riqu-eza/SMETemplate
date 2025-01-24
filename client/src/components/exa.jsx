/* eslint-disable no-undef */
/* eslint-disable react/jsx-no-undef */
<div className="image-container w-[350px] h-[500px] p-8 flex flex-col relative">
  {/* Product Image */}
  <Link
    to={`/product/${product._id}/${userId}`}
    className="flex justify-center items-center h-[70%] relative"
  >
    <div
      className="image-background"
      
    >
         <img
          src={product.imageUrls}
          alt={product.name}
          className=" object-cover w-[300px] h-[300px] " // Ensure the image takes full height and width
        />
    </div>
    <div className="image-overlay"></div> {/* Overlay with slight blue fade */}
  </Link>

  {/* Product Name */}
  <h3 className="text-sm font-medium text-center mt-2">{product.name}</h3>
  <h3 className="text-sm font-medium text-center mt-2">{product.price}</h3>

  {/* Action Buttons */}
  <div className="mt-6 flex flex-col gap-6 p-3">
    <HoverButton
      pretittle={"continue Shopping"}
      title="Add to Cart"
      link={`/cart/${product._id}/${userId}`}
    />
    <HoverButton
      pretittle={"check-out"}
      title="Buy Now"
      link={`/buy/${product._id}/${userId}`}
    />
  </div>
</div>
