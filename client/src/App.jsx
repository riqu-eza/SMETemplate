import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Cart from "./pages/purchasing/cart";
import Checkout from "./pages/purchasing/checkout";
import CategoryListing from "./pages/CategoryListing";
import Login from "./auth/Login";
import Signup from "./auth/signin";
import Profile from "./auth/Profile";
import { UserProvider } from "./context/UserContext";
import SearchResult from "./features/Search";
import { CartProvider } from "./context/CartContext";
import About from "./pages/About";
import NewListing from "./pages/newlisting";
import Popular from "./pages/Popular";
import Adminpage from "./admin/admin";
import Addblog from "./admin/createblog";
import ManageListing from "./admin/manageListing";
import ManagerOrders from "./admin/Manageorders";
import Listtall from "./components/Listall";
import ShopList from "./admin/Shop";
import AddProductsPage from "./admin/AddProduct";
import Header from "./components/header";
import ProductDetail from "./pages/productListing";

export default function App() {
  const [footerData, setFooterData] = useState(null);
  return (
    <CartProvider>
      <UserProvider>
        <BrowserRouter>
        <Header data={footerData}/>
          <div className="bg-root-pink">
            <Routes>
              {/* Pass the callback to Home */}
              <Route
                path="/"
                element={<Home setFooterData={setFooterData}  />}
              />
              <Route path="/createlisting" element={<ShopList />} />
              <Route
                path="product/:productId/:userId"
                element={<ProductDetail />}
              />
              <Route path="/add-products/:shopId" element={<AddProductsPage />} />
              <Route path="/cart/:productId/:userId" element={<Cart />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/buy/:productId/:userId"
                element={<Checkout />}
              />
              <Route path="/checkout/:orderId" element={<Checkout />} />
              <Route
                path="/category/:categoryName"
                element={<CategoryListing />}
              />
              <Route path="/alllisting" element={<Listtall />} />
              <Route path="/addblog" element={<Addblog />} />
              <Route path="/manageorders" element={<ManagerOrders />} />
              <Route path="/managelisting" element={<ManageListing />} />
              <Route path="/admin" element={<Adminpage />} />
              <Route path="/search" element={<SearchResult />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/About" element={<About />} />
              <Route path="/new-arrival" element={<NewListing />} />
              <Route path="/PopularChoises" element={<Popular />} />
            </Routes>
          </div>
          {/* Pass the footerData to Footer */}
          <Footer data={footerData} />
        </BrowserRouter>
      </UserProvider>
    </CartProvider>
  );
}
