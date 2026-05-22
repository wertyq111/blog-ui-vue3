<!-- 动森风上传：薄封装 el-upload，默认本地选择（不自动上传），通过 change 抛出文件 -->
<template>
  <el-upload
    class="animal-upload"
    action="#"
    :auto-upload="false"
    :show-file-list="showFileList"
    :accept="accept"
    :multiple="multiple"
    :on-change="handleChange"
  >
    <slot>
      <Button type="primary" size="small">
        <SystemIco name="plus" :size="13" />
        选择文件
      </Button>
    </slot>
  </el-upload>
</template>

<script setup lang="ts">
import type { UploadFile } from "element-plus";
import { Button } from "animal-island-vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";

defineOptions({ name: "AnimalUpload" });

withDefaults(
  defineProps<{
    accept?: string;
    showFileList?: boolean;
    multiple?: boolean;
  }>(),
  {
    accept: "",
    showFileList: false,
    multiple: false,
  }
);

const emit = defineEmits<{ change: [file: UploadFile] }>();

function handleChange(file: UploadFile): void {
  emit("change", file);
}
</script>
