<template>
  <div class="ata" :class="{ 'ata--disabled': disabled }">
    <textarea
      class="ata__inner"
      :value="model"
      :rows="rows"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
    />
    <span v-if="maxlength" class="ata__count">{{ (model ?? "").length }}/{{ maxlength }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    rows?: number;
    maxlength?: number;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    rows: 3,
    placeholder: "请输入",
    disabled: false,
  }
);

const model = defineModel<string>();

function onInput(e: Event): void {
  model.value = (e.target as HTMLTextAreaElement).value;
}
</script>

<style scoped lang="scss">
.ata {
  position: relative;
  width: 100%;
  font-family: Nunito, "Noto Sans SC", "Zen Maru Gothic", -apple-system, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.ata__inner {
  display: block;
  width: 100%;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
  color: #725d42;
  background: #fff;
  border: 2px solid #e8dcc8;
  border-radius: 14px;
  outline: 0;
  resize: vertical;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.ata__inner::placeholder {
  color: #a09080;
  font-weight: 400;
}
.ata__inner:hover {
  border-color: #d4c4a8;
  background: #fffdf7;
}
.ata__inner:focus {
  border-color: #19c8b9;
  background: #fffdf7;
  box-shadow: 0 0 0 3px rgba(25, 200, 185, 0.15);
}

.ata--disabled .ata__inner {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f0;
}

.ata__count {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: #c4b89e;
  pointer-events: none;
}
</style>
