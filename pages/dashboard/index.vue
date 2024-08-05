<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import RecentFilePreview from "~/components/dashboard/RecentFilePreview.vue";

const user = useSupabaseUser();
const searchText = ref("");
const favoriteOnly = ref(false);

// definePageMeta({
//   middleware: 'auth'
// })

const modifiedTime = {
  recent: 1000 * 60 * 5, // 5 minutes
  minutes: 1000 * 60 * 60, // 60 minutes
  hours: 1000 * 60 * 60 * 24, // 24 hours
  days: 1000 * 60 * 60 * 24 * 10, // 10 days
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function makeDate(modifiedDate: Date) {
  const now = new Date();

  if (now.getFullYear() !== modifiedDate.getFullYear()) {
    return `on ${months[modifiedDate.getMonth()]} ${modifiedDate.getDate()}, ${modifiedDate.getFullYear()}`
  }

  const diff = now.getTime() - modifiedDate.getTime();
  if (diff < modifiedTime.recent) {
    return `just now`
  }
  if (diff < modifiedTime.minutes) {
    return `${Math.floor(diff / 1000 / 60)} minutes ago`
  }
  if (diff < modifiedTime.hours) {
    const hours = Math.floor(diff / 1000 / 60 / 60)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }
  if (diff < modifiedTime.days) {
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`
  } else {  // months ago
    return `on ${months[modifiedDate.getMonth()]} ${modifiedDate.getDate()}`
  }
}

const fileSizeUnits = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

function makeFileSize(bytes: number, currentUnit: number = 0) {
  if (bytes < 1 && currentUnit === 0) {
    return "0 B"
  }
  if (bytes < 1024) {
    return `${Math.round(bytes)} ${fileSizeUnits[currentUnit]}`
  }
  return makeFileSize(bytes / 1024, currentUnit + 1);
}

const recentFiles = [
  {
    uuid: 1,
    fileName: "Recent File 1",
    lastModified: makeDate(new Date("December 17, 1995 03:24:00")),
    preview: `https://picsum.photos/360/270?${Math.random()}`,
    size: makeFileSize(Math.floor(Math.random() * 1_000_000_000)),
  },
  {
    uuid: 2,
    fileName: "Recent File 2",
    lastModified: makeDate(new Date("July 17, 2024 03:24:00")),
    preview: `https://picsum.photos/360/270?${Math.random()}`,
    size: makeFileSize(Math.floor(Math.random() * 1_000_000_000)),
  },
  {
    uuid: 3,
    fileName: "Recent File 3",
    lastModified: makeDate(new Date("August 5, 2024 03:24:00")),
    preview: `https://picsum.photos/360/270?${Math.random()}`,
    size: makeFileSize(Math.floor(Math.random() * 1_000_000_000)),
  },
  {
    uuid: 4,
    fileName: "Recent File 4",
    lastModified: makeDate(new Date("August 4, 2024 18:25:00")),
    preview: `https://picsum.photos/360/270?${Math.random()}`,
    size: makeFileSize(Math.floor(Math.random() * 1_000_000_000)),
  }
]
</script>

<template>
<!--  <SeoHead title="Dashboard" />-->
<!--      <el-container style="width: 100%; height: 100%">-->
<!--        <el-header class=nav>-->
<!--          <NavigationBar :name="user?.user_metadata?.name"-->
<!--                         :email="user?.user_metadata?.email"-->
<!--                         :avatar="user?.user_metadata?.avatar_url"/>-->
<!--        </el-header>-->
<!--        <el-container>-->
<!--          <el-aside class="dashboard-aside">Aside</el-aside>-->
<!--          <el-main>Dashboard-->
<!--            {{ user }}</el-main>-->
<!--        </el-container>-->
<!--      </el-container>-->

  <DashboardFrame activate="/dashboard" style="gap: 40px; display: flex; flex-direction: column">
    <nav class="dashboard-nav">
      <el-input v-model="searchText" autocomplete="off" clearable placeholder="Search critiques"
                :suffix-icon="Search" class="search-bar"/>
      <div class="avatar">
        <div  class="avatar-image" :style="{'background-image': `url('${user?.user_metadata?.avatar_url}')`}"></div>
      </div>
    </nav>

    <div class="new-file">
      <img class="new-file-icon" src="data:image/png;base64,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" alt="new file">
      <div class="new-file-text">
        <span>New File</span>
        <span class="description-text">Critical Thinking and Analysis</span>
      </div>
    </div>

    <div class="recent-files">
      <h3 class="subheading">Recent Files</h3>
      <div class="recent-file-display">
        <RecentFilePreview v-for="file of recentFiles.slice(0, 3)"
                           :key="file.uuid"
                           :file-name="file.fileName"
                           :last-modified="file.lastModified"
                           :preview-image="file.preview"></RecentFilePreview>
      </div>
    </div>

    <div class="file-list">
      <div class="file-list-options">
        <div class="selection">
          <div class="selection-button" :class="{selected: !favoriteOnly}" @click="favoriteOnly = false">
            <h3 class="selection-text">
              <el-icon><el-icon-folder style="width: 2rem; height: 1.5rem"></el-icon-folder></el-icon>
              All Files
            </h3>
          </div>
          <div class="selection-button" :class="{selected: favoriteOnly}" @click="favoriteOnly = true">
            <h3 class="selection-text">
              <el-icon><el-icon-star-filled style="width: 2rem; height: 2rem"></el-icon-star-filled></el-icon>
              Favorite
            </h3>
          </div>
        </div>
        <div class="order">
          <el-dropdown>
            <el-icon><el-icon-grid></el-icon-grid></el-icon>
          </el-dropdown>
        </div>
      </div>
    </div>
<!--    <img class="file-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACWCAMAAAAPKlHtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC9UExURQAAAP///+/v7/T09O/v7/Ly8u/v7/Hx8e/v7/Hx8e/v7/Hx8e/v7/Dw8O/v7/Dw8O/v7/Ly8vHx8fHx8fHx8fHx8fDw8PHx8fDw8PHx8fDw8PHx8fDw8PHx8fDw8PHx8cVMRMdSSshWT8pcVcphWsxmX81rZM9watB1b9J7ddJ/etSFgNWKhdePitiUj9qZlduemtujn96tquCzsOG3tOO9uuPBv+XHxebMyunW1evc2+vg3+3m5e7q6vDw8OQXKJYAAAAgdFJOUwAIEBggKDA4QEhQWGBocHiAh4+Xn6evt7/Hz9ff5+/3v+H4wgAAAAlwSFlzAAAXEQAAFxEByibzPwAABAFJREFUeF7tnGlX4jAUhoPihjoiAlZQthFExwXXYUbt//9Ztr03LG0v2WwbPHk+SErTt8+h4bZ42rAUKtVq02v5mdP2TqvV/Q3c6wo2Dhpd3CYvTg/LuPN0Nk+wY840t1AgSanawU75UyOO4t4FdiiEzj5qLPEL1xZGDUXmlAoaTYt4sUNY8nBFoZxvog5gwecUclZCn5DCxxOngUIBe/iWBRyhEisVWgtibKPUMS5bQROcNvM+2a0GPqo6LlnCWfRB4YI17ARSh9i2huNA6hTb1tAOrursGuYhW2wfWxZxxKrYsoi6bQUhxLNvnIcjPYefUqp0mE0nYw7DVyk+JuN+T4nRG26qhIrU9DfuSoVn3FgFBamPS9yPGhpWClIT3Isq6lYKUje4E2WUrRSkhrgPJaIvhqqVgpTWkLp8Dv8qWmUu5WtYZS+lYZWDlLqVhNT7w7g/Dl61pZStxFKvgyDRTErVSij1P3QylVK0EkrdRtmmUv5bWLBkrYRSoyjbWAqsJrggQCgF2eZSKlb5SSlY5Sglb5W11OATYiJkrbKW6j1CDCBppSl18w/WEnw+h3unWPJMQ1PqHVbS3GHHNPrYh0RTagoraa6xYyrYh0RTanA3WckV9ksHkmkyH+hpQDKNk+JAMo2T4kAyzU+SElT0VF5m/x/BN0g0pYQVPY1H3DgrKWFFT2N26sFlEk0pUUVPY37mgWSanzTQzYBkGifFgWQaJ8WBZBpNKVfRk0BMXMpV9CQQsxYD3QxIpnFSHEimcVIcSKbRlHIVPQnExKVcRU8CMWsx0M2AZBonxYFkGifFgWQaTSlX0ZNATFzKVfQkELMWA90MSKZxUhxIpnFSHEim0ZRyFT0JxMSlXEVPAjFrMdDNgGQaJ8WBZBonxYFkGifFgWQaJ8WBZJp1lgpvrRtD05zvun8qvFa5x6YxI4wmkZV69f3pqlvaVHjCaBJZqfug+YRtQ64heAWyUtFl3fQbhtVQeJuggtRw8YbNjJGW6l1p/FbQRF6q13/8wPeyRkEqYPgHr7d1wEAJ1KSMwEAJhFLfdnIZYKAEQintJ7DiiMvTDKHUX8w05gUDJRBK+Q8YasgtxskglvLfVt8ILMVI5QEjnxU36Q0Na2PDIrrMigldljm38zFyq2YFARr2zDMzp8bK2LKIXWbfE/cdxuybxaEeSG1j2xoqgZRtx+8imu5pB5cs4SB0YqyJi1bQAidWtmlql2hEhRzhGxaAMz2FWHMAWwuTmpUs+QZ2lmZhLFtxrdcNTjCLbFlwsdeJOTG2UfjVXittBs2CJ/BrLk7cN2f3DNcXQHtWnxJUChpZF4cokE6lnvvkQd3GQfqRW2Sn5nk5VYiu550kjhtjXxKtlCo5Z/3JAAAAAElFTkSuQmCC" alt="file">-->
  </DashboardFrame>
</template>

<style scoped>
.file-list-options {
  display: flex;
  justify-content: space-between;
}

.selection-button:deep(.el-icon) {
  height: unset;
  width: unset;
}

:deep(.el-button > span) {
  display: block;
  width: 100%;
}

.selection-button {
  width: 170px;
  height: 40px;
  border: none;
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

.recent-file-display {
  display: flex;
  gap: 20px;
}

.subheading {
  margin-top: 0;
  margin-left: var(--el-border-radius-round);
}

.new-file {
  display: flex;
  flex-direction: row;
  border-radius: var(--el-border-radius-round);
  border: 1px solid var(--el-border-color);
  padding: 20px;
  width: 300px;
  align-items: center;
  gap: 20px;
}

.new-file-icon {
  width: 50px;
  height: 50px;
}

.new-file-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dashboard-nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 20px;
}

.search-bar {
  width: 300px;
  height: 40px;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.avatar {
  height: 40px;
  width: 40px;
  background: var(--el-color-primary);
  border-radius: var(--el-border-radius-circle);
  overflow: hidden;
}
</style>