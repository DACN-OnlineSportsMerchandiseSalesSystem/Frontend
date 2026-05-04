import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { OrderSuccess } from "./pages/OrderSuccess";
import { OrderTracking } from "./pages/OrderTracking";
import { Account } from "./pages/Account";
import { Policy } from "./pages/Policy";
import { Returns } from "./pages/Returns";
import { Blog } from "./pages/Blog";
import { BlogDetail } from "./pages/BlogDetail";
import { Login } from "./pages/Login";
import { Admin } from "./pages/Admin";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "products", Component: Products },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "order-success/:orderId", Component: OrderSuccess },
      { path: "track-order", Component: OrderTracking },
      { path: "account", Component: Account },
      { path: "login", Component: Login },
      { path: "admin", Component: Admin },
      { path: "policy", Component: Policy },
      { path: "returns", Component: Returns },
      { path: "blog", Component: Blog },
      { path: "blog/:id", Component: BlogDetail },
      { path: "*", Component: NotFound },
    ],
  },
]);
