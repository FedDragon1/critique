<script setup lang="ts">

</script>

<template>
  <main class="no-file">
    <div class="file-upload block" @click="$emit('upload')">
      <img alt="upload"
           src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAABSCAYAAAARiVn+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMiSURBVHgB7Zy7axRRGMXPaIwvTFR8gagrRFGDFipYhCBoxEIEEQRjoZVWghIsBSOIVv4BKvFR2NgJEcSgaRKxEUHExhdIithoihTBB+O5jPER3c3s2Z39HOb7weEmu3P37vyS+5pZNkKNxHHcxWIA+eILcyiKorsQmIFiMou5wz/4AQgUVVqgmemjuN2okiJLCyxmblNcZzWVii4tsJzpp7gdaSu4tIQW5j7FbU1zsEv7xUJmgOK2THegS/uTMMY9pLj2Sge5tL9ZwjyiuFK5A1zav1nGDJYT59LKU2KGKK5t6hMurTIrkXTVdb8/6NKmZxXzgOLWTD7QxF9Op6j4lbnJDe44ikkJyXJkFx2MRPwhTlFpglnLCqNTn8jpVQ6V18we757VESaFQZdWPSVracPMZqaVmVtjwmp+L/MGGdMEOx4znRwn04ypaQjjbpjlOli+QyIyEyz/087XUdhP+JofWNxChlhKG0F2jCJDLKVtRHa0IUMspZ3j+NOKOsPX3MRiPzLEciIIs+YTnuQZJDPeBGpjPrOTuYBkNs4MS2mBDUw/coYvbgVcmoBLE3BpAi5NwHr2DHxkXiK50NkIFiBZ7jRDxFJa2HeeZS5lsQet2HAcz2HRxxyBgGX3vE5ZFxstLMA2w0L6GPMCApbSbsAQigvDgXQ1xFLaJ9gjbd0spe2DPR0QsJTWwwF5PYxg290sDkPAcvZcwTzjm7/G8j3zDY1hJrON6YaI9TptHnMKOcN3BAIuTcClCbg0AZcmYD17Tm5lXqFxhHMOH30/CBFLaWNMF/eAT2EA14cnWFyBgGX37LUSFmDbV1ncg4CltGHYI90+tJT2Gfa0QMBS2nEYwjEtYnEUApbSTvKN98AAthv2vOHjC+1CdfMlx2WeQNiwP0fjbqzMZrYzSyHyP9yNWv0jucF3BAIuTcClCbg0AZcm4NIEXJqASxNwaQIuTcClCbg0AZcm4NIEXJpAPa6nvWV6USBq/oqJIuLdU8ClCbg0AZcm4NIE0s6e4Z7kEPLJOGf9un4RQFppeWaM0hahjnj3FHBpAi5NwKUJuDSB7xSewOx66mW8AAAAAElFTkSuQmCC"/>
      <span>File Upload</span>
    </div>
    <div class="paste-text block" @click="$emit('text')">
      <img alt="from text"
           src="data:image/png;base64,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">
      <span>Paste Text</span>
    </div>
  </main>
</template>

<style scoped>
.no-file {
  display: flex;
  flex-direction: row;
  gap: 150px;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.paste-text {
  border: 1px solid var(--el-color-danger);
  color: var(--el-color-danger);
  background: white;
}

.file-upload {
  background: var(--el-color-danger);
  color: white;
}

.block {
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 200px;
  align-items: center;
  justify-content: center;
  gap: 20px;
  transition: 0.2s ease-out filter;
}

.block:hover {
  filter: drop-shadow(10px 10px 10px var(--el-color-danger));
}

.block > img {
  width: 60px;
}
</style>