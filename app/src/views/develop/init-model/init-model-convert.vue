<!-- 模型初始化转换：输入列定义，生成初始化代码 -->
<template>
  <AdminAnimalModal
    :visible="visible"
    title="模型初始化转换"
    width="720px"
    @update:visible="handleVisibleChange"
  >
    <el-form label-position="top" class="develop-dialog-form">
      <div class="field-desc">粘贴列 definition（每行一个），生成对应框架的初始化代码。</div>
      <el-form-item label="列 definition（每行一个）">
        <el-input v-model="columnsText" type="textarea" :rows="8" placeholder="请输入列定义内容" />
      </el-form-item>
      <el-form-item v-if="result" label="生成结果">
        <el-input v-model="result" type="textarea" :rows="12" readonly />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="develop-dialog-footer">
        <Button type="default" @click="closeDialog">关闭</Button>
        <Button type="primary" :loading="loading" @click="handleConvert">生成</Button>
      </div>
    </template>
  </AdminAnimalModal>
</template>

<script setup lang="ts">
import { message } from "@/utils/feedback";
import { ref, watch } from "vue";

import { Button } from "animal-island-vue";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import InitModelAPI from "@/api/develop/init-model";

const props = defineProps<{
  visible: boolean;
  modelId?: number;
}>();

const emit = defineEmits<{ "update:visible": [value: boolean] }>();

const columnsText = ref("");
const result = ref("");
const loading = ref(false);

function reset(): void {
  columnsText.value = "";
  result.value = "";
}

function closeDialog(): void {
  emit("update:visible", false);
  reset();
}

function handleVisibleChange(value: boolean): void {
  if (!value) closeDialog();
}

async function handleConvert(): Promise<void> {
  if (!props.modelId) return;
  const columns = columnsText.value
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!columns.length) {
    message.warning("请输入列 definition");
    return;
  }
  loading.value = true;
  try {
    const res = await InitModelAPI.convert(props.modelId, columns);
    result.value = Array.isArray(res) ? res.join("\n") : String(res);
    message.success("生成完成");
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) reset();
  }
);
</script>
