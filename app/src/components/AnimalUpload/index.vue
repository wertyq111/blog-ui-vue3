<!-- 动森风上传：原生 input file,本地选择(不自动上传),通过 change 抛出文件 -->
<template>
  <span class="animal-upload" @click="trigger">
    <slot>
      <Button type="primary" size="small">
        <SystemIco name="plus" :size="13" />
        选择文件
      </Button>
    </slot>
    <input
      ref="inputRef"
      type="file"
      class="animal-upload__input"
      :accept="accept"
      :multiple="multiple"
      @change="handleChange"
    />
  </span>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "animal-island-vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";

defineOptions({ name: "AnimalUpload" });

export interface AnimalUploadFile {
  raw: File;
  name: string;
}

withDefaults(
  defineProps<{
    accept?: string;
    multiple?: boolean;
  }>(),
  { accept: "", multiple: false }
);

const emit = defineEmits<{ change: [file: AnimalUploadFile] }>();
const inputRef = ref<HTMLInputElement>();

function trigger(): void {
  inputRef.value?.click();
}

function handleChange(e: Event): void {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (!files || !files.length) return;
  for (const f of Array.from(files)) {
    emit("change", { raw: f, name: f.name });
  }
  // 允许再次选择同一文件
  input.value = "";
}
</script>

<style scoped lang="scss">
.animal-upload {
  display: inline-flex;
  cursor: pointer;
}
.animal-upload__input {
  display: none;
}
</style>
