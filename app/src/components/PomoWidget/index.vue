<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { usePomoRuntime } from "@/composables/usePomoRuntime";
import { deerSrc } from "@/views/pomo/deer";

const store = usePomoRuntime();
const router = useRouter();

const deer = computed(() => deerSrc(store.characterState));

const mmss = computed(() => {
  const s = Math.max(0, store.remaining);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
});

const modeLabel = computed(() =>
  store.mode === "focus" ? "专注" : store.mode === "shortBreak" ? "短休" : "长休"
);

// 今日提醒：未完成的前 5 条
const todoTasks = computed(() => store.tasks.filter((t) => !t.done).slice(0, 5));

function expand() {
  router.push("/profile-center/pomo");
}
</script>

<template>
  <el-dropdown class="pomo-widget" trigger="click" popper-class="pomo-widget-popper">
    <div class="pomo-widget__trigger" :class="store.mode">
      <span class="dot" />
      <span class="time">{{ mmss }}</span>
    </div>

    <template #dropdown>
      <div class="pomo-panel">
        <div class="pomo-panel__head" :class="store.mode">
          <img :src="deer" class="deer" alt="" />
          <span class="label">🍅 {{ modeLabel }}</span>
          <span class="big">{{ mmss }}</span>
        </div>

        <div class="pomo-panel__controls">
          <button v-if="store.status === 'idle'" class="ctrl primary" @click="store.start()">
            ▶ 开始
          </button>
          <button
            v-else-if="store.status === 'running'"
            class="ctrl primary"
            @click="store.pause()"
          >
            ⏸ 暂停
          </button>
          <button v-else class="ctrl primary" @click="store.resume()">▶ 继续</button>
          <button v-if="store.status !== 'idle'" class="ctrl" @click="store.skip()">⏭ 跳过</button>
        </div>

        <div class="pomo-panel__current">
          <span v-if="store.currentTask">当前：{{ store.currentTask.title }}</span>
          <span v-else class="muted">未选择任务</span>
        </div>

        <div class="pomo-panel__tasks">
          <div class="title">今日提醒</div>
          <template v-if="todoTasks.length">
            <label v-for="t in todoTasks" :key="t.id" class="task">
              <input type="checkbox" :checked="!!t.done" @change="store.toggleDone(t.id)" />
              <span class="name">{{ t.title }}</span>
              <span class="pomos">{{ t.completedPomos }}/{{ t.estimatedPomos }}🍅</span>
            </label>
          </template>
          <div v-else class="muted empty">暂无未完成任务</div>
        </div>

        <button class="pomo-panel__expand" @click="expand">展开整页 →</button>
      </div>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
@use "../../views/pomo/styles/vars" as *;

.pomo-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  &__trigger {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 4px;
    font-weight: 800;
    font-size: 12px;
    color: var(--cyber-header-tool-text);
    cursor: pointer;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $tomato;
    }
    &.shortBreak .dot,
    &.longBreak .dot {
      background: $rest-orange;
    }
    .time {
      font-variant-numeric: tabular-nums;
    }
  }
}
</style>

<style lang="scss">
@use "../../views/pomo/styles/vars" as *;

// popper 在 body 顶层，需非 scoped
.pomo-widget-popper {
  .pomo-panel {
    width: 260px;
    padding: 14px;
    font-family: $font;

    &__head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      .deer {
        width: 46px;
        height: 46px;
        object-fit: contain;
        flex-shrink: 0;
        filter: drop-shadow(0 3px 4px rgba(61, 52, 40, 0.18));
      }
      .label {
        flex: 1;
        font-weight: 800;
        color: $text;
      }
      .big {
        font-size: 22px;
        font-weight: 900;
        font-variant-numeric: tabular-nums;
        color: $tomato;
      }
      &.shortBreak .big,
      &.longBreak .big {
        color: $rest-orange;
      }
    }

    &__controls {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      .ctrl {
        flex: 1;
        padding: 7px 0;
        border: none;
        border-radius: $radius-pill;
        background: $bg-input;
        color: $text;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 0 3px 0 0 $shadow-soft;
        &.primary {
          background: $primary;
          color: #fff;
          box-shadow: 0 3px 0 0 $primary-active;
        }
        &:active {
          transform: translateY(2px);
          box-shadow: none;
        }
      }
    }

    &__current {
      margin-bottom: 8px;
      font-size: 12px;
      color: $text;
      .muted {
        color: $text-secondary;
      }
    }

    &__tasks {
      .title {
        font-size: 12px;
        font-weight: 800;
        color: $text-secondary;
        margin-bottom: 4px;
      }
      .task {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 0;
        font-size: 13px;
        color: $text;
        cursor: pointer;
        .name {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pomos {
          font-size: 11px;
          color: $text-secondary;
        }
      }
      .empty {
        font-size: 12px;
        padding: 4px 0;
      }
      .muted {
        color: $text-secondary;
      }
    }

    &__expand {
      margin-top: 12px;
      width: 100%;
      padding: 8px;
      border: none;
      border-radius: $radius-pill;
      background: $primary;
      color: #fff;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 4px 0 0 $primary-active;
      &:active {
        transform: translateY(3px);
        box-shadow: 0 1px 0 0 $primary-active;
      }
    }
  }
}
</style>
