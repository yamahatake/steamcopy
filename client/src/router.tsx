import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Store from "./pages/Store";
import GameDetail from "./pages/GameDetail";
import Library from "./pages/Library";
import Cart from "./pages/Cart";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "store", element: <Store /> },
      { path: "game/:slug", element: <GameDetail /> },
      { path: "library", element: <Library /> },
      { path: "cart", element: <Cart /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);
