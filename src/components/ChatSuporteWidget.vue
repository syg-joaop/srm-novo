<template>
  <div
    class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end"
    style="z-index: 9999"
  >
    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="mb-4 w-[calc(100vw-2rem)] sm:w-[380px] h-[calc(100vh-6rem)] sm:h-[550px] max-h-[550px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border"
        style="background-color: var(--color-surface); border-color: var(--color-border)"
      >
        <div
          class="p-4 flex items-center justify-between border-b"
          style="background-color: var(--color-surface); border-color: var(--color-border)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center p-1.5"
              style="background-color: var(--color-primary)"
            >
              <img
                src="~/assets/sparkler.png"
                alt="Suporte"
                class="w-full h-full object-contain brightness-0 invert"
              />
            </div>

            <div>
              <h3 class="font-semibold text-sm" style="color: var(--color-text)">
                Central de Ajuda
              </h3>
              <p class="text-xs" style="color: var(--color-text-muted)">
                {{ isChatConfigured ? "Online agora" : "Indisponível" }}
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="isOpen = false"
            class="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-hover)]"
            style="color: var(--color-text-muted)"
          >
            <X :size="18" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="flex flex-col"
            :class="msg.isUser ? 'items-end' : 'items-start'"
          >
            <div
              class="max-w-[80%] p-3 rounded-2xl text-sm"
              :class="msg.isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'"
              :style="
                msg.isUser
                  ? 'background-color: var(--color-primary); color: white;'
                  : 'background-color: var(--color-hover); color: var(--color-text);'
              "
            >
              {{ msg.text }}
            </div>
            <span class="text-[10px] mt-1 px-1" style="color: var(--color-text-muted)">
              {{ msg.time }}
            </span>
          </div>

          <div v-if="isTyping" class="flex items-start">
            <div
              class="p-3 rounded-2xl rounded-tl-sm flex gap-1.5"
              style="background-color: var(--color-hover)"
            >
              <span
                class="w-2 h-2 rounded-full animate-bounce"
                style="background-color: var(--color-text-muted); animation-delay: 0ms"
              ></span>
              <span
                class="w-2 h-2 rounded-full animate-bounce"
                style="background-color: var(--color-text-muted); animation-delay: 150ms"
              ></span>
              <span
                class="w-2 h-2 rounded-full animate-bounce"
                style="background-color: var(--color-text-muted); animation-delay: 300ms"
              ></span>
            </div>
          </div>

          <div ref="messagesEndRef"></div>
        </div>

        <div
          class="p-4 border-t"
          style="background-color: var(--color-surface); border-color: var(--color-border)"
        >
          <form @submit.prevent="sendMessage" class="flex gap-2 items-center">
            <input
              v-model="newMessage"
              type="text"
              :placeholder="
                !isChatConfigured
                  ? 'O suporte está indisponível no momento.'
                  : 'Digite sua mensagem...'
              "
              class="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 py-2"
              style="color: var(--color-text)"
              :disabled="!isChatConfigured"
            />
            <button
              type="submit"
              :disabled="!newMessage.trim() || !isChatConfigured"
              class="p-2 rounded-lg transition-all disabled:opacity-40 hover:bg-[var(--color-hover)]"
              :style="{
                color: newMessage.trim() ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }"
            >
              <Send :size="18" />
            </button>
          </form>
        </div>
      </div>
    </Transition>

    <button
      type="button"
      @click="toggleChat"
      class="group relative w-14 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      :class="[hasUnreadMessages && !isOpen ? 'animate-pulse-slow' : '']"
      style="background-color: var(--color-primary); border: 1px solid var(--color-border)"
      :aria-label="isOpen ? 'Fechar chat' : 'Abrir chat'"
    >
      <div
        v-if="hasUnreadMessages && !isOpen"
        class="absolute inset-0 rounded-xl animate-ping-slow opacity-40"
        style="background-color: var(--color-primary)"
      ></div>

      <div
        class="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div>

      <div class="relative z-10 flex items-center justify-center w-full h-full p-3">
        <img
          src="~/assets/sparkler.png"
          alt="Central de Ajuda"
          class="w-full h-full object-contain transition-all duration-300 brightness-0 invert"
          :class="isOpen ? 'rotate-180' : 'group-hover:scale-110'"
        />
      </div>

      <span
        v-if="hasUnreadMessages && !isOpen"
        class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 z-20 animate-pulse"
        style="border-color: var(--color-primary)"
      ></span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { X, Send } from "lucide-vue-next";

type ChatMessage = {
  text: string;
  isUser: boolean;
  time: string;
};

const config = useRuntimeConfig();
const chatUrl = computed(() => String(config.public.supportChatUrl ?? ""));
const isChatConfigured = computed(() => Boolean(chatUrl.value));

const isOpen = ref(false);
const newMessage = ref("");
const isTyping = ref(false);
const messagesEndRef = ref<HTMLElement | null>(null);
const hasUnreadMessages = ref(false);
const hasInitialized = ref(false);
const sessionId = ref<string | null>(null);

const messages = ref<ChatMessage[]>([]);

const formatTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const scrollToBottom = async () => {
  await nextTick();
  messagesEndRef.value?.scrollIntoView({ behavior: "smooth" });
};

const pushAssistantMessage = async (text: string) => {
  messages.value.push({ text, isUser: false, time: formatTime() });
  await scrollToBottom();
};

const pushUserMessage = async (text: string) => {
  messages.value.push({ text, isUser: true, time: formatTime() });
  await scrollToBottom();
};

const toggleChat = async () => {
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    hasUnreadMessages.value = false;

    if (!hasInitialized.value) {
      hasInitialized.value = true;
      isTyping.value = true;
      await scrollToBottom();

      setTimeout(async () => {
        isTyping.value = false;
        await pushAssistantMessage("Olá! Como posso ajudar você hoje?");
      }, 800);
    }
  }
};

const sendMessage = async () => {
  const userText = newMessage.value.trim();
  if (!userText) return;

  if (!isChatConfigured.value) {
    await pushAssistantMessage("O suporte está indisponível no momento.");
    return;
  }

  newMessage.value = "";
  await pushUserMessage(userText);

  isTyping.value = true;
  await scrollToBottom();

  try {
    const response = await fetch(chatUrl.value, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userText,
        sessionId: sessionId.value,
        humanize: false,
      }),
    });

    const result = await response.json();
    isTyping.value = false;

    if (result?.success && result?.data) {
      sessionId.value = result.data.sessionId ?? sessionId.value;
      await pushAssistantMessage(String(result.data.answer ?? ""));
    } else {
      await pushAssistantMessage("Desculpe, não consegui processar sua mensagem. Tente novamente.");
    }
  } catch {
    isTyping.value = false;
    await pushAssistantMessage("Erro ao conectar com o servidor. Verifique sua conexão.");
  }

  if (!isOpen.value) {
    hasUnreadMessages.value = true;
  }
};

watch(isOpen, (val) => {
  if (val) scrollToBottom();
});
</script>

<style scoped>
.slide-up-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.slide-up-enter-from {
  transform: translateY(30px) scale(0.95);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(20px) scale(0.98);
  opacity: 0;
}

@keyframes pulse-slow {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2.5s ease-in-out infinite;
}

@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>
