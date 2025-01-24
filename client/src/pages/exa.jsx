/* eslint-disable react/jsx-no-undef */
<>
  <div
    className="flex justify-between items-center p-4 pt-6 mt-6 bg-gray-100"
    style={{
      backgroundImage: `url('/background-image.jpg')`, // Replace with your image filename
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "75vh", // 3/4 of the screen height
    }}
  >
    {/* Left Section with One Word and additional text below */}
    <div className="flex flex-col justify-center items-start w-1/2">
      <div className="text-white text-5xl font-bold mb-4">
        Lskin
      </div>
      {/* Additional wordings in the middle of the left side */}
      <div className="text-white text-2xl">
        Embrace Your Natural Beauty
      </div>
      <p className="text-white mt-2 text-lg">
        Explore a wide range of luxury cosmetics, carefully crafted to enhance your skin and bring out the best version of you.
      </p>
    </div>

    {/* Right Section with 3 Links */}
    <div className="flex gap-8">
      <Link to="/login" className="text-blue-500 hover:underline">
        account
      </Link>
      <Link to="/search" className="text-blue-500 hover:underline">
        search
      </Link>
      <Link to="/cart" className="text-blue-500 hover:underline">
        cart
      </Link>
      <Link to="/createlisting" className="text-blue-500 hover:underline">
        admin
      </Link>
    </div>
  </div>
</>
