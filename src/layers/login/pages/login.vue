<script setup lang="ts">
import { Eye, EyeOff, Info, Moon, Sun } from "lucide-vue-next";
import UiButton from "~/components/ui/UiButton.vue";
import UiCheckbox from "~/components/ui/UiCheckbox.vue";
import UiInput from "~/components/ui/UiInput.vue";

definePageMeta({
  layout: "blank",
});

const { login } = useAuth();
const config = useRuntimeConfig();
const { theme, toggleTheme } = useTheme();

const credentials = ref({
  email: "",
  password: "",
  origem: "SRM",
  remember: false,
  terms: true,
  colaborador: "",
  password_colaborador: "",
  remember_colaborador: false,
});

const showPassword = ref(false);
const showSygecomPassword = ref(false);

const isSygecomUser = computed(() => {
  // Mostra o modal apenas se tiver número antes de @sygecom (ex: 1@sygecom, 123@sygecom)
  return /^\d+@sygecom/.test(credentials.value.email);
});
const loading = ref(false);
const errorMessage = ref("");

const appVersion = config.public.appVersion;
const { loadSavedCredentials } = useAuthPersistence();

onMounted(() => {
  const saved = loadSavedCredentials();
  if (saved) {
    credentials.value = { ...credentials.value, ...saved };
  }
});

const handleLogin = async () => {
  if (!credentials.value.terms) {
    errorMessage.value = "Você precisa aceitar os termos para continuar.";
    return;
  }

  errorMessage.value = "";
  loading.value = true;

  try {
    // Monta payload - envia colaborador/password_colaborador apenas se modal foi exibido
    const payload = {
      email: credentials.value.email,
      password: credentials.value.password,
      origem: credentials.value.origem,
      remember: credentials.value.remember,
      terms: credentials.value.terms,
      // Inclui dados de colaborador apenas se o modal foi exibido (número antes de @sygecom)
      ...(isSygecomUser.value && {
        colaborador: credentials.value.colaborador,
        password_colaborador: credentials.value.password_colaborador,
        remember_colaborador: credentials.value.remember_colaborador,
      }),
    };

    const result = await login(payload);
    if (!result.success) {
      errorMessage.value = result.error || "Erro ao fazer login";
    }
  } catch (e) {
    errorMessage.value = "Erro ao fazer login";
  } finally {
    loading.value = false;
  }
};

watch(
  () => credentials.value,
  () => {
    errorMessage.value = "";
  },
  { deep: true },
);
</script>

<template>
  <div
    class="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row lg:overflow-hidden transition-colors duration-300"
    style="background-color: var(--color-background); color: var(--color-text)"
  >
    <div
      class="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
      style="background-color: var(--color-surface)"
    >
      <img
        src="~/assets/img/capa-srm.webp"
        alt="SRM Illustration"
        class="w-full h-full object-cover opacity-80"
      />
      <div class="absolute inset-0 bg-black/10"></div>
    </div>

    <div
      class="w-full lg:w-1/2 flex flex-col relative transition-colors duration-300 lg:overflow-y-auto"
      style="background-color: var(--color-background)"
    >
      <div
        class="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-4"
        style="color: var(--color-text-muted)"
      >
        <button
          @click="toggleTheme"
          class="hover:text-primary transition-colors"
          :title="theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
        >
          <Sun v-if="theme === 'dark'" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>
        <button class="hover:text-primary transition-colors">
          <Info class="w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 py-10">
        <div class="w-full max-w-sm space-y-6 sm:space-y-8">
          <div class="text-center">
            <img src="~/assets/img/srm.png" alt="SRM Logo" class="h-12 sm:h-16 mx-auto mb-2" />
            <p class="text-xs" style="color: var(--color-text-muted)">v{{ appVersion }}</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5 sm:space-y-6 mt-6 sm:mt-8">
            <div class="space-y-4">
              <UiInput
                v-model="credentials.email"
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                required
                class="theme-input"
              />

              <UiInput
                v-model="credentials.password"
                label="Senha"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Sua senha"
                required
                class="theme-input"
              >
                <template #suffix>
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="hover:text-primary focus:outline-none transition-colors pointer-events-auto"
                    style="color: var(--color-text-muted)"
                  >
                    <Eye v-if="!showPassword" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </template>
              </UiInput>
            </div>

            <Transition name="expand">
              <div v-if="isSygecomUser" class="overflow-hidden mt-4">
                <div
                  class="p-4 sm:p-5 rounded-lg border transition-all duration-300 ease-in-out"
                  style="background-color: var(--color-surface); border-color: var(--color-border)"
                >
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-sm" style="color: var(--color-primary)">
                      Usuário Sygecom
                    </h3>
                    <UiCheckbox
                      v-model="credentials.remember_colaborador"
                      label="Lembrar acesso"
                      class="theme-checkbox"
                      size="small"
                    />
                  </div>

                  <div class="space-y-4">
                    <UiInput
                      v-model="credentials.colaborador"
                      label="Usuário"
                      placeholder=""
                      class="theme-input"
                    />

                    <UiInput
                      v-model="credentials.password_colaborador"
                      label="Senha"
                      :type="showSygecomPassword ? 'text' : 'password'"
                      placeholder=""
                      class="theme-input"
                    >
                      <template #suffix>
                        <button
                          type="button"
                          @click="showSygecomPassword = !showSygecomPassword"
                          class="hover:text-primary focus:outline-none transition-colors pointer-events-auto"
                          style="color: var(--color-text-muted)"
                        >
                          <Eye v-if="!showSygecomPassword" class="w-4 h-4" />
                          <EyeOff v-else class="w-4 h-4" />
                        </button>
                      </template>
                    </UiInput>
                  </div>
                </div>
              </div>
            </Transition>

            <div class="space-y-4">
              <UiCheckbox
                v-model="credentials.remember"
                label="Lembrar meu acesso"
                class="theme-checkbox"
              />

              <div class="flex flex-col sm:flex-row sm:justify-between gap-4">
                <UiCheckbox v-model="credentials.terms" class="theme-checkbox">
                  <span
                    class="text-xs sm:text-sm leading-tight"
                    style="color: var(--color-text-muted)"
                  >
                    Aceito os termos
                    <a href="#" class="hover:underline" style="color: var(--color-primary)"
                      >Política de Privacidade</a
                    >
                  </span>
                </UiCheckbox>

                <UiButton
                  type="submit"
                  variant="primary"
                  :loading="loading"
                  class="!bg-[var(--color-primary)] hover:!bg-[var(--color-primary-dark)] !text-white px-6 w-full sm:w-auto"
                >
                  Entrar
                </UiButton>
              </div>
            </div>

            <div
              v-if="errorMessage"
              class="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded border border-red-500/20"
            >
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.input-label) {
  color: var(--color-text) !important;
  font-size: 0.8rem !important;
  margin-bottom: 4px !important;
  opacity: 0.9;
}

:deep(.base-input) {
  background-color: var(--color-surface) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text) !important;
  padding: 12px !important;
  transition: all 0.3s ease;
}

:deep(.base-input:focus) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 1px var(--color-primary) !important;
}

:deep(.base-checkbox) {
  color: var(--color-text-muted) !important;
}

:deep(.checkmark) {
  background-color: var(--color-surface) !important;
  border-color: var(--color-border) !important;
}

:deep(.base-checkbox input:checked ~ .checkmark) {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

:deep(.base-input::placeholder) {
  color: var(--color-text-muted) !important;
  opacity: 0.5;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 500px;
  opacity: 1;
  transform: translateY(0) scale(1);
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0 !important;
  transform: translateY(-10px) scale(0.98);
}
</style>
