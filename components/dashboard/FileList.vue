<script setup lang="ts">
import {useTime} from "~/composibles/useTime";
import {useFile} from "~/composibles/useFile";
import {Calendar, Crop, Sort} from "@element-plus/icons-vue";

const props = defineProps<{
  files: CritiqueFull[]
}>()

const { makeDate } = useTime()
const { makeFileSize } = useFile()

const router = useRouter()

const favoriteOnly = ref(false);
const orderBy = ref<keyof CritiqueFull>("lastModified")

const orderedFilesRaw = computed(() => props.files
    .toSorted((f1, f2) =>
          +(f1[orderBy.value] > f2[orderBy.value])
        + +(f1[orderBy.value] >= f2[orderBy.value])
        - 1
    )
    .map(file => {
      return {
        ...file,
        lastModified: makeDate(file.lastModified),
        size: makeFileSize(file.size)
      }
    })
    .filter(file => !favoriteOnly.value || file.isFavorite)
)

const orderedFiles = computed(() => orderBy.value === "lastModified" ? orderedFilesRaw.value.toReversed() : orderedFilesRaw.value)
</script>

<template>
  <div>
    <div class="file-list-options">
      <div class="selection">
        <div class="big-icon selection-button hover-color" :class="{selected: !favoriteOnly}" @click="favoriteOnly = false">
          <h3 class="selection-text">
            <el-icon size="1.5rem"><el-icon-folder></el-icon-folder></el-icon>
            All Files
          </h3>
        </div>
        <div class="big-icon selection-button hover-color" :class="{selected: favoriteOnly}" @click="favoriteOnly = true">
          <h3 class="selection-text">
            <el-icon size="2rem"><el-icon-star-filled></el-icon-star-filled></el-icon>
            Favorite
          </h3>
        </div>
      </div>
      <div class="order">
        <el-dropdown v-model="orderBy" class="big-icon">
          <el-icon class="hover-color" size="1.5rem">
            <el-icon-grid></el-icon-grid>
          </el-icon>
          <template #dropdown>
            <el-dropdown-item :icon="Calendar" @click="orderBy = 'lastModified'">Most Recent</el-dropdown-item>
            <el-dropdown-item :icon="Crop" @click="orderBy = 'size'">File Size</el-dropdown-item>
            <el-dropdown-item :icon="Sort" @click="orderBy = 'fileName'">Alphabetical</el-dropdown-item>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="file-table">
      <div class="file-entry"
           @click="() => router.push(`/analytic/${file.uuid}`)"
           v-if="orderedFiles.length > 0"
           v-for="file in orderedFiles"
           :key="file.uuid">
        <div class="entry-section ops">
          <main>
            <img class="file-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACWCAMAAAAPKlHtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC9UExURQAAAP///+/v7/T09O/v7/Ly8u/v7/Hx8e/v7/Hx8e/v7/Hx8e/v7/Dw8O/v7/Dw8O/v7/Ly8vHx8fHx8fHx8fHx8fDw8PHx8fDw8PHx8fDw8PHx8fDw8PHx8fDw8PHx8cVMRMdSSshWT8pcVcphWsxmX81rZM9watB1b9J7ddJ/etSFgNWKhdePitiUj9qZlduemtujn96tquCzsOG3tOO9uuPBv+XHxebMyunW1evc2+vg3+3m5e7q6vDw8OQXKJYAAAAgdFJOUwAIEBggKDA4QEhQWGBocHiAh4+Xn6evt7/Hz9ff5+/3v+H4wgAAAAlwSFlzAAAXEQAAFxEByibzPwAABAFJREFUeF7tnGlX4jAUhoPihjoiAlZQthFExwXXYUbt//9Ztr03LG0v2WwbPHk+SErTt8+h4bZ42rAUKtVq02v5mdP2TqvV/Q3c6wo2Dhpd3CYvTg/LuPN0Nk+wY840t1AgSanawU75UyOO4t4FdiiEzj5qLPEL1xZGDUXmlAoaTYt4sUNY8nBFoZxvog5gwecUclZCn5DCxxOngUIBe/iWBRyhEisVWgtibKPUMS5bQROcNvM+2a0GPqo6LlnCWfRB4YI17ARSh9i2huNA6hTb1tAOrursGuYhW2wfWxZxxKrYsoi6bQUhxLNvnIcjPYefUqp0mE0nYw7DVyk+JuN+T4nRG26qhIrU9DfuSoVn3FgFBamPS9yPGhpWClIT3Isq6lYKUje4E2WUrRSkhrgPJaIvhqqVgpTWkLp8Dv8qWmUu5WtYZS+lYZWDlLqVhNT7w7g/Dl61pZStxFKvgyDRTErVSij1P3QylVK0EkrdRtmmUv5bWLBkrYRSoyjbWAqsJrggQCgF2eZSKlb5SSlY5Sglb5W11OATYiJkrbKW6j1CDCBppSl18w/WEnw+h3unWPJMQ1PqHVbS3GHHNPrYh0RTagoraa6xYyrYh0RTanA3WckV9ksHkmkyH+hpQDKNk+JAMo2T4kAyzU+SElT0VF5m/x/BN0g0pYQVPY1H3DgrKWFFT2N26sFlEk0pUUVPY37mgWSanzTQzYBkGifFgWQaJ8WBZBpNKVfRk0BMXMpV9CQQsxYD3QxIpnFSHEimcVIcSKbRlHIVPQnExKVcRU8CMWsx0M2AZBonxYFkGifFgWQaTSlX0ZNATFzKVfQkELMWA90MSKZxUhxIpnFSHEim0ZRyFT0JxMSlXEVPAjFrMdDNgGQaJ8WBZBonxYFkGifFgWQaJ8WBZJp1lgpvrRtD05zvun8qvFa5x6YxI4wmkZV69f3pqlvaVHjCaBJZqfug+YRtQ64heAWyUtFl3fQbhtVQeJuggtRw8YbNjJGW6l1p/FbQRF6q13/8wPeyRkEqYPgHr7d1wEAJ1KSMwEAJhFLfdnIZYKAEQintJ7DiiMvTDKHUX8w05gUDJRBK+Q8YasgtxskglvLfVt8ILMVI5QEjnxU36Q0Na2PDIrrMigldljm38zFyq2YFARr2zDMzp8bK2LKIXWbfE/cdxuybxaEeSG1j2xoqgZRtx+8imu5pB5cs4SB0YqyJi1bQAidWtmlql2hEhRzhGxaAMz2FWHMAWwuTmpUs+QZ2lmZhLFtxrdcNTjCLbFlwsdeJOTG2UfjVXittBs2CJ/BrLk7cN2f3DNcXQHtWnxJUChpZF4cokE6lnvvkQd3GQfqRW2Sn5nk5VYiu550kjhtjXxKtlCo5Z/3JAAAAAElFTkSuQmCC" alt="file">
            <span>{{ file.fileName }}</span>
          </main>
          <aside>
            <el-icon v-if="file.isFavorite"
                     size="1.8rem"
                     @click.stop="$emit('unfavorite', file.uuid)"
                     class="op-icon favorite"><el-icon-Star-filled /></el-icon>
            <el-icon v-else
                     size="1.5rem"
                     @click.stop="$emit('favorite', file.uuid)"
                     class="hover-color op-icon secondary"><el-icon-Star /></el-icon>

            <el-icon size="1.5rem"
                     @click.stop="$emit('rename', file.uuid)"
                     class="hover-color op-icon secondary"><el-icon-edit /></el-icon>

            <el-icon size="1.5rem"
                     @click.stop="$emit('delete', file.uuid)"
                     class="hover-color op-icon secondary"><el-icon-delete /></el-icon>
          </aside>
        </div>
        <div class="info">
          <div class="entry-section">
            <span class="secondary">Last edited {{ file.lastModified }}</span>
          </div>
          <div class="entry-section">
            <span class="secondary">{{ file.size }}</span>
          </div>
        </div>
      </div>
      <div v-else class="no-file">
        <span class="secondary">It is empty here.</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-file {
  width: 100%;
  height: 40vh;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite {
  color: var(--el-color-danger)
}

.favorite:hover {
  color: white;
  filter: drop-shadow(var(--el-color-danger) 0 0 5px);
}

.op-icon {
  transition: color 0.2s ease-in-out;
}

.op-icon:hover {
  color: var(--el-color-danger);
}

.secondary {
  color: var(--el-text-color-secondary)
}

main {
  display: flex;
  height: 100%;
  flex-grow: 1;
  align-items: center;
  gap: 20px;
}

aside {
  display: flex;
  gap: 5px;
  margin-right: 10%;
  align-items: center;
}

.info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-grow: 1;
}

.ops {
  width: 45%;
}

.entry-section {
  gap: 20px;
  height: 100%;
  display: flex;
  align-items: center;
}

.file-icon {
  height: 100%;
  aspect-ratio: 1 / 1;
}

.file-entry {
  display: flex;
  height: 50px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-round);
  align-items: center;
  padding: 8px 15px 8px 8px;
  gap: 20px;
  transition: 0.2s all ease-in-out;
}

.file-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hover-color {
  border: 1px solid transparent;
}

.file-entry:hover {
  border: 1px solid var(--el-color-danger);
  color: var(--el-color-danger)
}

.order {
  display: flex;
  align-items: center;
}

.file-list-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.big-icon:focus-visible {
  outline: none;
}

:deep(.el-button > span) {
  display: block;
  width: 100%;
}

.selection-button {
  width: 170px;
  height: 40px;
  display: flex;
  align-items: center;
  border-radius: var(--el-border-radius-round);
  padding: 10px var(--el-border-radius-round);
  transition: all 0.2s ease-in-out;
}

.selection-button.selected {
  background-color: var(--el-color-danger);
  color: var(--el-color-white)
}

.selection-text {
  display: flex;
  gap: 5px;
  align-items: center;
}

.selection {
  display: flex;
  gap: 20px;
}
</style>