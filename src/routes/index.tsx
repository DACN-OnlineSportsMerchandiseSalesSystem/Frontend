import { createBrowserRouter } from "react-router";
import { Root } from "@/layouts/MainLayout/MainLayout";
import { Home } from "@/pages/Home/index";
import { ProductDetail } from "@/pages/Product/ProductDetail";
import { Cart } from "@/pages/Cart/index";
import { Checkout } from "@/pages/Checkout/index";
import { OrderSuccess } from "@/pages/Checkout/OrderSuccess";
import { NotFound } from "@/pages/NotFound/index";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "order-success/:orderId", Component: OrderSuccess },
      { path: "*", Component: NotFound },
    ],
  },
]);