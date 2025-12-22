<template>
  <UiModal v-model="isOpen" size="large" :show-close="true">
    <template #title>
      <div class="flex items-center gap-2">
        <RouteIcon class="w-5 h-5 text-[var(--color-primary)]" />
        <span>Cadastro de rota</span>
      </div>
    </template>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
      <div class="lg:col-span-4 flex flex-col gap-6">
        <FormularioRota
          v-model:nome="formData.nome"
          v-model:data-inicio="formData.dataInicio"
          v-model:data-fim="formData.dataFim"
          v-model:observacoes="formData.observacoes"
        />

        <ListaFornecedoresRota
          v-model="fornecedores"
          v-model:novo-fornecedor="novoFornecedor"
          @add="addFornecedor"
          @remove="removeFornecedor"
        />
      </div>

      <div class="lg:col-span-8 min-h-[350px] lg:min-h-0">
        <div
          class="h-full rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-background)]"
        >
          <UiMapaPontos :pontos="pontosMapa" class="w-full h-full" />
        </div>
      </div>
    </div>

    <template #footer>
      <UiButton variant="secondary" @click="handleCancel"> Cancelar </UiButton>
      <UiButton variant="primary" :disabled="!isFormValid" @click="handleSave">
        <Plus class="w-4 h-4" />
        Criar rota
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { Route as RouteIcon, Plus } from "lucide-vue-next";
import UiModal from "~/components/ui/UiModal.vue";
import UiButton from "~/components/ui/UiButton.vue";
import UiMapaPontos from "~/components/ui/UiMapaPontos.vue";
import type { UiMapaPonto } from "~/components/ui/maps.types";
import FormularioRota from "./FormularioRota.vue";
import ListaFornecedoresRota from "./ListaFornecedoresRota.vue";
import type { FornecedorRotaSimples } from "../rotas.types";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  save: [data: typeof formData.value & { fornecedores: FornecedorRotaSimples[] }];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const formData = ref({
  nome: "",
  dataInicio: null as Date | null,
  dataFim: null as Date | null,
  observacoes: "",
});

const novoFornecedor = ref("");
const fornecedores = ref<FornecedorRotaSimples[]>([]);

const isFormValid = computed(() => {
  return (
    formData.value.nome.trim() !== "" &&
    formData.value.dataInicio !== null &&
    formData.value.dataFim !== null
  );
});

const pontosMapa = computed<UiMapaPonto[]>(() => {
  return fornecedores.value.map((f) => ({
    id: f.name,
    titulo: f.name,
    status: "ativo",
    latitude: f.lat,
    longitude: f.lng,
    linhas: [{ rotulo: "Cidade", valor: "Local" }],
  }));
});

const addFornecedor = () => {
  if (!novoFornecedor.value.trim()) return;

  const baseLat = -15.7801;
  const baseLng = -47.9292;
  const randomLat = baseLat + (Math.random() - 0.5) * 0.1;
  const randomLng = baseLng + (Math.random() - 0.5) * 0.1;

  fornecedores.value.push({
    name: novoFornecedor.value.trim(),
    lat: randomLat,
    lng: randomLng,
  });

  novoFornecedor.value = "";
};

const removeFornecedor = (index: number) => {
  fornecedores.value.splice(index, 1);
};

const resetForm = () => {
  formData.value = {
    nome: "",
    dataInicio: null,
    dataFim: null,
    observacoes: "",
  };
  fornecedores.value = [];
  novoFornecedor.value = "";
};

const handleCancel = () => {
  resetForm();
  isOpen.value = false;
};

const handleSave = () => {
  if (!isFormValid.value) return;

  emit("save", {
    ...formData.value,
    fornecedores: fornecedores.value,
  });

  resetForm();
  isOpen.value = false;
};
</script>
