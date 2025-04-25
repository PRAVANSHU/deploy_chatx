import "../app/globals.css"; // Ensure this path is correct

// Internal imports
import { ChatAppProvider } from "@/Context/ChatAppContext";
import { NavBar } from "@/Components/index1"; // Ensure folder casing is correct

const MyApp = ({ Component, pageProps }) => (
  <ChatAppProvider>
    <NavBar />  {/* ✅ Ensure NavBar is rendered in your app */}
    <Component {...pageProps} />
  </ChatAppProvider>
);

export default MyApp;
