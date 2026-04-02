import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createPermissionPlugin } from '../permission'

describe('permission directives', () => {
  it('toggles permission-gated nodes when the permission source changes', async () => {
    let permissions = ['sys:user:add']

    const Host = defineComponent({
      props: {
        version: {
          type: Number,
          required: true,
        },
      },
      template: `
        <section :data-version="version">
          <button id="all" v-permission="['sys:user:add', 'sys:user:edit']">all</button>
          <button id="any" v-any-permission="['sys:user:edit', 'sys:user:delete']">any</button>
        </section>
      `,
    })

    const wrapper = mount(Host, {
      props: {
        version: 1,
      },
      global: {
        plugins: [createPermissionPlugin(() => permissions)],
      },
    })

    expect(wrapper.find('#all').exists()).toBe(false)
    expect(wrapper.find('#any').exists()).toBe(false)

    permissions = ['sys:user:add', 'sys:user:edit']
    await wrapper.setProps({
      version: 2,
    })

    expect(wrapper.find('#all').exists()).toBe(true)
    expect(wrapper.find('#any').exists()).toBe(true)

    permissions = []
    await wrapper.setProps({
      version: 3,
    })

    expect(wrapper.find('#all').exists()).toBe(false)
    expect(wrapper.find('#any').exists()).toBe(false)
  })
})
