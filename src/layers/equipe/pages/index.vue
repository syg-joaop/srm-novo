<template>
  <div
    class="min-h-screen p-4 sm:p-6 pb-20 transition-colors"
    style="background-color: var(--color-background); color: var(--color-text)"
  >
    <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Equipe</h1>

    <div class="flex items-center gap-2 w-full md:max-w-xl mb-6">
      <div class="relative flex-1">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
          style="color: var(--color-text-muted)"
        />
        <input
          v-model="search"
          type="text"
          placeholder="Pesquise o usuário"
          class="w-full rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all border"
          style="
            background-color: var(--color-surface);
            border-color: var(--color-border);
            color: var(--color-text);
          "
          @keyup.enter="handleSearch"
        />
      </div>

      <button
        class="p-2.5 rounded-lg transition-colors"
        style="background-color: var(--color-primary); color: #fff"
        @click="handleSearch"
      >
        <Search class="w-5 h-5" />
      </button>
    </div>

    <div>
      <div class="mb-4 font-semibold text-sm" style="color: var(--color-primary)">
        {{ filteredMembros.length }} resultados
      </div>

      <ListaMembros :membros="paginatedMembros" @select="handleSelectMembro" />

      <UiPaginacao
        :page="currentPage"
        :total-items="filteredMembros.length"
        :total-pages="totalPages"
        class="mt-6"
        @update:page="(p) => (currentPage = p)"
      />
    </div>

    <ModalDetalhesParceiro v-model="showModal" :parceiro="membroSelecionado" variant="time" />
  </div>
</template>

<script setup lang="ts">
import { Search } from "lucide-vue-next";
import ModalDetalhesParceiro from "~/components/common/ModalDetalhesParceiro.vue";
import type { Membro } from "../components/ListaMembros.vue";
import ListaMembros from "../components/ListaMembros.vue";

definePageMeta({ layout: "default" });

const search = ref("");
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;

const showModal = ref(false);
const membroSelecionado = ref<Membro | null>(null);

const membrosMock: Membro[] = [
  {
    id: 1,
    nome: "Lucas candido",
    email: "Lucas Candido Soares de Figueiredo",
    setor: "ADMINISTRATIVO",
  },
  {
    id: 2,
    nome: "Junior",
    email: "eng.meirelesjunior@gmail.com",
    setor: "BALANÇA",
  },
  {
    id: 3,
    nome: "Deyfferson",
    email: "WILKLIFFD@GMAIL.COM",
    setor: "ADMINISTRATIVO",
  },
  {
    id: 4,
    nome: "Michele",
    email: "micherlania.21@hotmail.com",
    setor: "FINANCEIRO",
  },
  {
    id: 5,
    nome: "Leticia",
    email: "leticiasilveiiira@gmail.com",
    setor: "ADMINISTRATIVO",
  },
  { id: 6, nome: "Joseilton", email: "JJ988815596@GMAIL.COM", setor: "SUCATA" },
  { id: 7, nome: "Raquel", email: "raquelruthinha.rl@gmail.com", setor: "RH" },
  {
    id: 8,
    nome: "Lucas absalao",
    email: "Lucasabsalao17@gmail.com",
    setor: "ADMINISTRATIVO",
  },
  {
    id: 9,
    nome: "Joao teixeira",
    email: "j.compal@hotmail.com",
    setor: "BALANÇA",
  },
  {
    id: 10,
    nome: "Adriano",
    email: "fiscal3@reciaco.ind.br",
    setor: "ADMINISTRATIVO",
  },
  {
    id: 11,
    nome: "Carlos Silva",
    email: "carlos.silva@empresa.com",
    setor: "FINANCEIRO",
  },
  {
    id: 12,
    nome: "Maria Santos",
    email: "maria.santos@empresa.com",
    setor: "RH",
  },
  {
    id: 13,
    nome: "Pedro Costa",
    email: "pedro.costa@empresa.com",
    setor: "SUCATA",
  },
  {
    id: 14,
    nome: "Ana Oliveira",
    email: "ana.oliveira@empresa.com",
    setor: "ADMINISTRATIVO",
  },
  {
    id: 15,
    nome: "Bruno Ferreira",
    email: "bruno.ferreira@empresa.com",
    setor: "BALANÇA",
  },
];

const handleSearch = () => {
  searchQuery.value = search.value;
  currentPage.value = 1;
};

const filteredMembros = computed(() => {
  if (!searchQuery.value.trim()) {
    return membrosMock;
  }
  const query = searchQuery.value.toLowerCase();
  return membrosMock.filter(
    (m) =>
      m.nome.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.setor.toLowerCase().includes(query),
  );
});

const totalPages = computed(() => Math.ceil(filteredMembros.value.length / itemsPerPage));

const paginatedMembros = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredMembros.value.slice(start, end);
});

watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const handleSelectMembro = (membro: Membro) => {
  membroSelecionado.value = {
    ...membro,
  };
  showModal.value = true;
};
</script>
