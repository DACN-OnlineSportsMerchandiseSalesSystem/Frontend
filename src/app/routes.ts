import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./pages/Home";

// Lazy-load non-critical routes for faster initial page load
const Products = lazy(() => import("./pages/Products").then(m => ({ default: m.Products })));
const ProductDetail = lazy(() => import("./pages/ProductDetail").then(m => ({ default: m.ProductDetail })));
const Cart = lazy(() => import("./pages/Cart").then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import("./pages/Checkout").then(m => ({ default: m.Checkout })));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess").then(m => ({ default: m.OrderSuccess })));
const OrderTracking = lazy(() => import("./pages/OrderTracking").then(m => ({ default: m.OrderTracking })));
const Account = lazy(() => import("./pages/Account").then(m => ({ default: m.Account })));
const Policy = lazy(() => import("./pages/Policy").then(m => ({ default: m.Policy })));
const Returns = lazy(() => import("./pages/Returns").then(m => ({ default: m.Returns })));
const Blog = lazy(() => import("./pages/Blog").then(m => ({ default: m.Blog })));
const BlogDetail = lazy(() => import("./pages/BlogDetail").then(m => ({ default: m.BlogDetail })));
const Login = lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Admin = lazy(() => import("./pages/Admin").then(m => ({ default: m.Admin })));
const NotFound = lazy(() => import("./pages/NotFound").then(m => ({ default: m.NotFound })));
const VNPayReturn = lazy(() => import("./pages/VNPayReturn").then(m => ({ default: m.VNPayReturn })));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "products", Component: Products },
      { path: "product/:id", Component: ProductDetail },
      { path: "products/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "order-success/:orderId", Component: OrderSuccess },
      { path: "payment/vnpay-return", Component: VNPayReturn },
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

