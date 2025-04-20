import React from "react";
import ReactDOM from "react-dom/client";
import App from "src/App";
import { ChakraProvider } from "@chakra-ui/react";
import { PageProvider } from "src/hook/PageContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ChakraProvider>
      <PageProvider>
        <App />
      </PageProvider>
  </ChakraProvider>
);