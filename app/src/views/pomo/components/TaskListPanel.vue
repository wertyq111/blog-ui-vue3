<script setup lang="ts">
import { ref } from "vue";
import { usePomoStore } from "@/store/modules/pomo";
import TaskCard from "./TaskCard.vue";
import FoxButton from "./FoxButton.vue";

const emit = defineEmits<{ start: [id: number] }>();
const store = usePomoStore();
const draft = ref("");

function add() {
  const title = draft.value.trim();
  if (!title) return;
  store.addTask(title);
  draft.value = "";
}
</script>

<template>
  <div class="task-view">
    <div class="adder">
      <input
        v-model="draft"
        class="input"
        placeholder="添加一个任务…"
        maxlength="60"
        @keyup.enter="add"
      />
      <FoxButton type="primary" size="sm" @click="add">添加</FoxButton>
    </div>

    <div v-if="store.tasks.length" class="list">
      <TaskCard
        v-for="t in store.tasks"
        :key="t.id"
        :task="t"
        :active="t.id === store.linkedTaskId"
        @toggle="store.toggleDone(t.id)"
        @remove="store.removeTask(t.id)"
        @select="emit('start', t.id)"
      />
    </div>

    <div v-else class="empty">
      <div class="emoji">🌱</div>
      <div>还没有任务<br />添加一个，开始专注吧</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;
.task-view {
  display: flex;
  flex-direction: column;
  gap: $space-md;
  padding: $space-lg $space-md;
  height: 100%;
}

.adder {
  display: flex;
  gap: $space-sm;
}
.input {
  flex: 1;
  min-width: 0;
  border: 2.5px solid $border-light;
  background: $bg-input;
  border-radius: $radius-pill;
  padding: 10px 16px;
  font-family: $font;
  font-weight: 600;
  font-size: 15px;
  color: $text;
  box-shadow: 0 3px 0 0 $shadow-soft;
  transition: all $motion-base $motion-ease;
  &::placeholder {
    color: $text-disabled;
    font-weight: 400;
  }
  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.list {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  overflow-y: auto;
}

.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $space-md;
  text-align: center;
  color: $text-secondary;
  font-weight: 600;
  line-height: 1.6;
  .emoji {
    font-size: 48px;
  }
}
</style>
