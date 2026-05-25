<!-- 路径转换工具：粘贴路径自动按映射转换 -->
<template>
  <div class="convert-tool">
    <div class="convert-tool__body">
      <div class="convert-tool__col">
        <div class="convert-tool__label">输入路径（每行一个）</div>
        <el-input
          v-model="input"
          type="textarea"
          :rows="6"
          placeholder="粘贴或输入需要转换的路径..."
          @input="onInput"
        />
      </div>
      <div class="convert-tool__col">
        <div class="convert-tool__label">转换结果</div>
        <el-input v-model="output" type="textarea" :rows="6" readonly />
      </div>
    </div>
    <div class="convert-tool__footer">
      <Button type="default" size="small" @click="clear">清空</Button>
      <Button v-if="output" type="primary" size="small" @click="copyResult">复制结果</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message } from "@/utils/feedback";
import { onMounted, ref } from "vue";
import { useClipboard, useDebounceFn } from "@vueuse/core";

import { Button } from "animal-island-vue";
import ServerPathAPI from "@/api/develop/server-path";
import type { ServerPathItem } from "@/types/api/server-path";

const input = ref("");
const output = ref("");
const allPaths = ref<ServerPathItem[]>([]);
const { copy } = useClipboard();

function parseSources(raw: string): string[] {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function autoConvert(): void {
  const value = input.value;
  if (!value || !value.trim()) {
    output.value = "";
    return;
  }
  const lines = value.split("\n");
  const results = lines.map((line) => {
    if (!line.trim()) return "";
    const processed = line
      .replace(/[一-龥]/g, "")
      .replace(/\|/g, "/")
      .trim();
    if (!processed) return "";
    for (const item of allPaths.value) {
      for (const source of parseSources(item.sources)) {
        const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(escaped).test(processed)) {
          return processed.replace(new RegExp(escaped), item.target).replace(/\\/g, "/");
        }
      }
    }
    return processed.replace(/\\/g, "/");
  });
  output.value = results.filter(Boolean).join(" ");
}

const onInput = useDebounceFn(autoConvert, 300);

async function copyResult(): Promise<void> {
  if (!output.value) return;
  try {
    await copy(output.value);
    message.success("已复制到剪贴板");
  } catch {
    message.error("复制失败");
  }
}

function clear(): void {
  input.value = "";
  output.value = "";
}

onMounted(async () => {
  try {
    allPaths.value = await ServerPathAPI.getAll();
  } catch {
    message.error("加载项目配置失败");
  }
});
</script>

<style lang="scss" scoped>
.convert-tool {
  margin: 0 0 16px;
  padding: 16px;
  border-radius: 16px;
  border: 2px dashed rgba(74, 138, 54, 0.25);
  background: rgba(247, 251, 243, 0.6);
}

.convert-tool__body {
  display: flex;
  gap: 16px;
}

.convert-tool__col {
  flex: 1;
  min-width: 0;
}

.convert-tool__label {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ai-text, #794f27);
}

.convert-tool__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
</style>
