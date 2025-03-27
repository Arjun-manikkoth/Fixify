import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { store, persistor } from "./Redux/Store";
import { SidebarContextProvider } from "./Contexts/SidebarContext";
import { PersistGate } from "redux-persist/integration/react";
import StripeProvider from "./stripe/StripeProvider";
import { NotificationProvider } from "./Contexts/NotificationContext";
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <Provider store={store}>
        <SidebarContextProvider>
            <NotificationProvider>
                <PersistGate loading={null} persistor={persistor}>
                    <StripeProvider>
                        <App />
                    </StripeProvider>
                </PersistGate>
            </NotificationProvider>
        </SidebarContextProvider>
    </Provider>
);
