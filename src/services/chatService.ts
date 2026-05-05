import api from "./api";

export const chatService = {
  chat: async (message: string) => {
    try {
      const response = await api.post("/chatbot", { message });
      return response.data;
    } catch (error) {
      console.error("Chat API error:", error);
      throw error;
    }
  },
};
