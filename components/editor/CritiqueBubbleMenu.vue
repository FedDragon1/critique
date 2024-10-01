<script setup lang="ts">
import {faBold, faItalic, faStrikethrough, faUnderline} from '@fortawesome/free-solid-svg-icons'
import {faCopy, faPaste} from '@fortawesome/free-regular-svg-icons'
import {cacheOfPromises, forceRender, useEditorTransforms} from "~/composibles/useTiptapEditor";
import TextIcon from "~/components/svg/TextIcon.vue";
import H1Icon from "~/components/svg/H1Icon.vue";
import H2Icon from "~/components/svg/H2Icon.vue";
import H3Icon from "~/components/svg/H3Icon.vue";
import type {NodeType} from "~/types/tiptap";
import BulletedListIcon from "~/components/svg/BulletedListIcon.vue";
import NumberedListIcon from "~/components/svg/NumberedListIcon.vue";
import LowConfidenceFix from "~/components/editor/LowConfidenceFix.vue";
import type {BaseResponse, ReviseRequest} from "~/types/requests";

const props = defineProps<{
    editor: any,
}>()

setInterval(() => textType.value = textTf.getTextType(props.editor.commands.getCurrentNode()), 200)

const textTf = useEditorTransforms()
const textType = ref(textTf.getTextType(props.editor.commands.getCurrentNode()));
const fixId = ref("")
const segmentFrom = computed(() => parseInt(fixId.value?.split("-")[1]) + parseInt(fixId.value?.split("-")[3]))
const segmentTo = computed(() => parseInt(fixId.value?.split("-")[2]) + parseInt(fixId.value?.split("-")[3]))

const possibleTextTypes: NodeType[] = [
    {
        display: "Text",
        icon: TextIcon,
        callback: () => props.editor.commands.setNode("paragraph")
    },
    {
        display: "Heading 1",
        icon: H1Icon,
        callback: () => props.editor.commands.setNode("heading", {level: 1})
    },
    {
        display: "Heading 2",
        icon: H2Icon,
        callback: () => props.editor.commands.setNode("heading", {level: 2})
    },
    {
        display: "Heading 3",
        icon: H3Icon,
        callback: () => props.editor.commands.setNode("heading", {level: 3})
    },
]
const possibleLabelTypes: NodeType[] = [
    {
        display: "Bulleted List",
        icon: BulletedListIcon,
        callback: () => props.editor.chain().focus().toggleBulletList().run()
    },
    {
        display: "Numbered List",
        icon: NumberedListIcon,
        callback: () => props.editor.chain().focus().toggleOrderedList().run()
    }
]

function ancestorIsLowConfidence(node?: Node | null) {
    if (!node) {
        return false;
    }
    if (node.nodeName === "LOW-CONFIDENCE" && node.nodeType === 1) {
        // @ts-ignore
        fixId.value = node.getAttribute("data-id")
        return true;
    }
    if (node.parentElement === null) {
        return false;
    }
    return ancestorIsLowConfidence(node.parentElement)
}

function checkInLowConfidence() {
    return ancestorIsLowConfidence(window?.getSelection()?.focusNode);
}

function notInLowConfidence({editor}: { editor: any }) {
    if (ancestorIsLowConfidence(window?.getSelection()?.focusNode)) {
        return false;
    }

    // reset
    fixId.value = ""

    // check if currently selecting
    const {empty} = editor.state.selection
    return !empty
}

function ignoreCorrection() {
    const text = props.editor.state.doc.textBetween(segmentFrom.value + 1, segmentTo.value - 1, ' ')
    props.editor.commands.insertContentAt({
        from: segmentFrom.value,
        to: segmentTo.value
    }, text)
}

function correct(to: string) {
    props.editor.commands.insertContentAt({
        from: segmentFrom.value,
        to: segmentTo.value
    }, to)
}

function ignoreAll() {
    let fixes = 0;

    [...document.querySelectorAll("low-confidence")]
        .map(node => {
            const id = node.getAttribute("data-id")
            if (id === null) {
                return
            }

            const from = parseInt(id.split("-")[1]) + parseInt(id.split("-")[3])
            const to = parseInt(id.split("-")[2]) + parseInt(id.split("-")[3])

            return {
                from,
                to,
            }
        })
        .filter(x => x !== undefined)
        .toSorted((a, b) => {
            if (a === undefined || b === undefined) {
                return -1;
            }
            if (a.from !== b.from) {
                return a.from - b.from
            }
            return a.to - b.to
        })
        .forEach(node => {
            if (!node) {
                throw Error("node is undefined")
            }

            let {from, to} = node

            from -= fixes * 2
            to -= fixes * 2
            fixes++

            const text = props.editor.state.doc.textBetween(from + 1, to - 1, ' ')
            props.editor.commands.insertContentAt({
                from: from,
                to: to
            }, text)
        })
    forceRender()
}

function fixMatching() {
    type FixPromise = {
        fix: string,
        id: string
    }

    let fixed = 0;
    const promises: Promise<FixPromise>[] = [];
    document.querySelectorAll("low-confidence").forEach(node => {

        const id = node.getAttribute("data-id")
        if (id === null) {
            return
        }
        const cacheId = id.split("-").slice(0, -1).join("-")

        const promise = cacheOfPromises.get(cacheId);
        if (!promise) {
            setTimeout(() => {
                throw Error(`fix for ${cacheId} does not exist`)
            })
            return;
        }
        promises.push(new Promise<FixPromise>((resolve, reject) => {
            promise.then(fix => resolve({fix, id}))
                .catch(e => reject(e))
        }))
    })

    Promise.all(promises).then((fixes) => {
        fixes.forEach(({fix, id}) => {
            // each success fix will reduce two LRM marks from the document
            const from = parseInt(id.split("-")[1]) + parseInt(id.split("-")[3]) - 2 * fixed
            const to = parseInt(id.split("-")[2]) + parseInt(id.split("-")[3]) - 2 * fixed

            const text = props.editor.state.doc.textBetween(from + 1, to - 1, ' ')
            if (text === fix) {
                props.editor.commands.insertContentAt({
                    from: from,
                    to: to
                }, text)
                fixed++
            }
        })
        forceRender()
    })
}

function fixSelected() {
    const maxLength = 2600;
    const minLength = 100;

    const selectedText = props.editor.commands.getSelectedText()
    const {from, to, empty} = props.editor.state.selection

    if (selectedText === null && empty) {
        ElMessage.error({
            message: `No text selected`,
            grouping: true
        })
        return;
    }
    if (selectedText.length > maxLength) {
        ElMessage.error({
            message: `Selection is too long (>${maxLength})`,
            grouping: true
        })
        return;
    }
    if (selectedText.length < minLength) {
        ElMessage.error({
            message: `Selection is too short (<${minLength})`,
            grouping: true
        })
        return;
    }

    const requestBody: ReviseRequest = {
        selection: selectedText
    }

    $fetch<BaseResponse<string>>("/api/critique/revise", {
        method: "POST",
        body: requestBody
    }).then(resp => {
        if (!resp.success) {
            ElMessage.error(resp.errorMessage)
            return;
        }

        props.editor.commands.insertContentAt({
            from,
            to
        }, resp.data)
    })
}

defineExpose({
    ignoreAll,
    fixMatching,
    fixSelected
})
</script>

<template>
    <TiptapBubbleMenu class="editor-bubble-menu normal"
                      :should-show="notInLowConfidence"
                      :tippy-options="{ duration: 100, maxWidth: 450 }"
                      :editor="editor">
        <div class="menu-wrapper">
            <div class="bubble-section">
                <el-dropdown class="bubble-op" trigger="click">
          <span class="dropdown">
            {{ textType }}
            <el-icon><el-icon-arrow-down :size="20"/></el-icon>
          </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="type in possibleTextTypes"
                                              @click="type.callback"
                                              :icon="type.icon"
                                              :key="type.display">
                                {{ type.display }}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <el-dropdown class="bubble-op" trigger="click">
          <span class="dropdown">
            {{
                  editor.isActive('orderedList') ? "Ordered List"
                      : editor.isActive('bulletList') ? "Bulleted List"
                          : "List"
              }}
            <el-icon><el-icon-arrow-down :size="20"/></el-icon>
          </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="type in possibleLabelTypes"
                                              @click="type.callback"
                                              :icon="type.icon"
                                              :key="type.display">
                                {{ type.display }}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <span class="divider">|</span>
            <div class="bubble-section">
        <span @click="editor.chain().focus().toggleBold().run()"
              class="bubble-op"
              :class="{ 'is-active': editor.isActive('bold') }">
        <font-awesome :icon="faBold" size="xs"/>
        </span>
                <span @click="editor.chain().focus().toggleItalic().run()"
                      class="bubble-op"
                      :class="{ 'is-active': editor.isActive('italic') }">
          <font-awesome :icon="faItalic" size="xs"/>
        </span>
                <span @click="editor.chain().focus().toggleStrike().run()"
                      class="bubble-op"
                      :class="{ 'is-active': editor.isActive('strike') }">
          <font-awesome :icon="faStrikethrough" size="xs"/>
        </span>
                <span @click="editor.chain().focus().toggleUnderline().run()"
                      class="bubble-op"
                      :class="{ 'is-active': editor.isActive('underline') }">
          <font-awesome :icon="faUnderline" size="xs"/>
        </span>
            </div>
            <span class="divider">|</span>
            <div class="bubble-section">
        <span @click="editor.commands.copy()"
              class="bubble-op">
          <font-awesome :icon="faCopy" size="xs"/>
          Copy
        </span>
                <span @click="editor.commands.paste()"
                      class="bubble-op">
          <font-awesome :icon="faPaste" size="xs"/>
          Paste
        </span>
            </div>
        </div>
    </TiptapBubbleMenu>
    <TiptapBubbleMenu class="editor-bubble-menu low-conf"
                      :should-show="checkInLowConfidence"
                      :tippy-options="{ duration: 100, maxWidth: 1000 }"
                      :editor="editor">
        <div class="menu-wrapper">
            <div class="bubble-section">
                <span class="bubble-op">
                    <LowConfidenceFix
                        @fix="correct"
                        :segment-id="fixId"/>
                </span>
                <span class="bubble-op" @click="ignoreCorrection">
                    <el-icon size="0.875rem"><el-icon-circle-close/></el-icon>
                    Ignore correction
                </span>
            </div>
            <span class="divider">|</span>
            <div class="bubble-section">
                <el-dropdown class="bubble-op" trigger="click">
          <span class="dropdown">
            {{ textType }}
            <el-icon><el-icon-arrow-down :size="20"/></el-icon>
          </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="type in possibleTextTypes"
                                              @click="type.callback"
                                              :icon="type.icon"
                                              :key="type.display">
                                {{ type.display }}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <el-dropdown class="bubble-op" trigger="click">
          <span class="dropdown">
            {{
                  editor.isActive('orderedList') ? "Ordered List"
                      : editor.isActive('bulletList') ? "Bulleted List"
                          : "List"
              }}
            <el-icon><el-icon-arrow-down :size="20"/></el-icon>
          </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="type in possibleLabelTypes"
                                              @click="type.callback"
                                              :icon="type.icon"
                                              :key="type.display">
                                {{ type.display }}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </TiptapBubbleMenu>
</template>

<style scoped>
.dropdown {
    display: flex;
    gap: 5px;
}

.divider {
    color: var(--el-text-color-secondary);
    font-size: 1.2rem;
    user-select: none;
}

.bubble-section {
    gap: 15px;
    display: flex;
    align-items: center;
}

.bubble-op {
    color: var(--el-text-color);
    font-size: 0.875rem;
    cursor: pointer;
    transition: color 0.2s ease-in-out;
    text-wrap: nowrap;
    display: flex;
    align-items: center;
    gap: 5px;
}

.bubble-op:hover {
    color: var(--el-color-primary);
}


.bubble-op.is-active {
    color: var(--el-color-primary);
}

.menu-wrapper {
    border: var(--el-border);
    background: var(--el-color-white);
    padding: 5px 10px;
    border-radius: var(--el-border-radius-base);
    display: flex;
    gap: 15px;
    align-items: center;
}
</style>