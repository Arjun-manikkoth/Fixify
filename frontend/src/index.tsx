import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { store, persistor } from "./Redux/Store";
import { PersistGate } from "redux-persist/integration/react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
            <ToastContainer position="bottom-right" />
        </PersistGate>
    </Provider>
);
