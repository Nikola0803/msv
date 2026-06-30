import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Shop from "../pages/shop/page";
import ProductDetail from "../pages/product/page";
import About from "../pages/about/page";
import FAQs from "../pages/faqs/page";
import Contact from "../pages/contact/page";
import TrackOrder from "../pages/track-order/page";
import Login from "../pages/login/page";
import Register from "../pages/register/page";
import ForgotPassword from "../pages/forgot-password/page";
import ResetPassword from "../pages/reset-password/page";
import BundlesPage from "../pages/bundles/page";
import BundleDetail from "../pages/bundle/page";
import CheckoutPage from "../pages/checkout/page";
import CoaPage from "../pages/coa/page";
import ResearchUsePolicy from "../pages/research-use-policy/page";
import TermsOfService from "../pages/terms-of-service/page";
import PrivacyPolicy from "../pages/privacy-policy/page";
import ReturnPolicy from "../pages/return-policy/page";
import Blog from "../pages/blog/page";
import BlogPost from "../pages/blog-post/page";
import FunnelPage from "../pages/funnel/page";
import ComingSoon from "../pages/coming-soon/page";
import Veterans from "../pages/veterans/page";

const routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/shop", element: <Shop /> },
  { path: "/product/:id", element: <ProductDetail /> },
  { path: "/about", element: <About /> },
  { path: "/faqs", element: <FAQs /> },
  { path: "/contact", element: <Contact /> },
  { path: "/track-order", element: <TrackOrder /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/bundles", element: <BundlesPage /> },
  { path: "/bundle/:id", element: <BundleDetail /> },
  { path: "/checkout", element: <CheckoutPage /> },
  { path: "/coa", element: <CoaPage /> },
  { path: "/blog", element: <Blog /> },
  { path: "/blog/:id", element: <BlogPost /> },
  { path: "/funnel", element: <FunnelPage /> },
  { path: "/research-use-policy", element: <ResearchUsePolicy /> },
  { path: "/terms-of-service", element: <TermsOfService /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/return-policy", element: <ReturnPolicy /> },
  { path: "/coming-soon", element: <ComingSoon /> },
  { path: "/veterans", element: <Veterans /> },
  { path: "*", element: <NotFound /> },
];

export default routes;