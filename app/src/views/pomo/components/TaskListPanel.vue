<script setup lang="ts">
import { computed, ref } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { usePomoStore } from "@/store/modules/pomo";
import TaskCard from "./TaskCard.vue";
import FoxButton from "./FoxButton.vue";

const emit = defineEmits<{ start: [id: number] }>();
const store = usePomoStore();
const draft = ref("");

const activeCount = computed(() => store.tasks.filter((t) => !t.done).length);

function add() {
  const title = draft.value.trim();
  if (!title) return;
  store.addTask(title);
  draft.value = "";
}
</script>

<template>
  <div class="task-view">
    <div class="section-head">
      <div>
        <h1>林间清单</h1>
        <p>专注当下，收获成长</p>
      </div>
      <span class="count-pill">{{ activeCount }} 个待办</span>
    </div>

    <div class="adder">
      <input
        v-model="draft"
        class="input"
        placeholder="添加一个任务..."
        maxlength="60"
        @keyup.enter="add"
      />
      <FoxButton type="primary" size="sm" class="add-btn" @click="add">
        <el-icon><Plus /></el-icon>
        <span>添加</span>
      </FoxButton>
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
      <div class="sprout">🌱</div>
      <div>还没有任务<br />添加一个，开始专注吧</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;

.task-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: $space-md;
  padding: 8px $space-lg $space-lg;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-md;

  h1 {
    margin: 0;
    color: $text;
    font-size: 30px;
    font-weight: 900;
    line-height: 1.08;
  }

  p {
    margin: 6px 0 0;
    color: $text-secondary;
    font-size: 14px;
    font-weight: 800;
  }
}

.count-pill {
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid rgba($shadow-soft, 0.82);
  border-radius: $radius-pill;
  background: rgba(255, 247, 220, 0.72);
  color: $text-secondary;
  font-size: 13px;
  font-weight: 900;
}

.adder {
  display: flex;
  gap: $space-sm;
}

.input {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  border: 2.5px solid $border-light;
  border-radius: $radius-pill;
  background: $bg-input;
  color: $text;
  font-family: $font;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 3px 0 0 $shadow-soft;
  transition: all $motion-base $motion-ease;

  &::placeholder {
    color: $text-disabled;
    font-weight: 500;
  }

  &:focus {
    border-color: $primary;
    outline: none;
  }
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.list {
  overflow-y: auto;
  border: 2px solid rgba($border-light, 0.88);
  border-radius: $radius-lg;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.48), rgba(255, 250, 228, 0.5)),
    $bg-input;
  box-shadow: 0 4px 0 0 rgba($shadow-soft, 0.78);
}

.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $space-md;
  color: $text-secondary;
  text-align: center;
  font-weight: 800;
  line-height: 1.6;
}

.sprout {
  font-size: 52px;
  line-height: 1;
}

@media (max-height: 780px) {
  .task-view {
    gap: 10px;
    padding-top: 4px;
  }

  .section-head h1 {
    font-size: 25px;
  }

  .section-head p,
  .count-pill {
    font-size: 12px;
  }

  .input {
    padding-block: 10px;
  }
}
</style>
