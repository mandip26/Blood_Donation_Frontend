import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ChatbotProvider } from "@/components/common/ChatbotProvider";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ChatbotProvider>
      <RouterProvider router={router} />
    </ChatbotProvider>
  );
}
