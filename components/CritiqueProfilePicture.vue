<script setup lang="ts">

</script>

<template>
<div class="critique-pfp">
    <img alt="critique"
         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANGSURBVHgBnZZNSFRRFMfPuW+cmaJFGfQhQUHQhzVj6hh9WDmYw/gF2rIgsl20ahMkoQuZsVW0CVqU5EYiglYzQuKoiKSSaQoRWlhgUQtDSLLJ9+7p3MnRGX2Md+a/mPvufeee35xzz3nvIWSh5d7IeVPKagThQ6LDBLRHrSPgHAHOIslBi8zo1mDjqN1+1IHEeyKXJdEtNvbp2CPCe7Aw5ArWdmnDliKR/ZgHnQB0AXIQATyDvOU7W/yNn9VcZDLGbXlOTpUHchSn+pRbsosVZYS5LwRmhGX4Of55yBYEMOtyiAqsrP2SspauoUBgFzitl1JC07lo77Rai3d3e8kwu9m8ADSkQE4D/akgpQ2RYZ5s5d8ziNjfV1N1Qq25qqsneahgL18hR9DKvTW9bggekKY5u7pA8JOr8HQywkWO0GFYMb7cmS1oY2SWdXfd7nwhsG+wpvKQmm7jCF2Ifr6czxaUBqPWVsFRNNrYFAiDgXWBooTTqtopiNNp1cjZgNJgoxPDZ3nIt7UiKDBAxpJAd339DEnDzzU9zw2sBUqDmdI8msmQHecbKKMjDf9T6g4GPwpOqVPogdJgRGLfZsbEEZomV2ldxRE1d3FKdUFpMHbl1tyz10lGF2k+V21hAvCPzgZVDLhE9ZjIbI4wQjm3mbECkZT+M7FYorlDxceutvm8h0FTqzCLHBOgATobjSXOKFTiuUbCeIoEA+2+omLICrYYf8seF2ytCKZlHMuToHCp9wa/tDow8eqC3dyfvTrAVZi/v98kko/AJiIgGSjv6fmWiKiMIwJ4COkFssMiGQ2Xeo5owZQcv+EBD0upoPWpA4kdYFOJ/ETZIwH6wsWFhaADOxWL/eCU3VfX3FPTqaC2Ek+TSh1kKPkEUDiGQqXekk1hSovLop0PPQJ/cS0in+cmPy2egEZvscF2TnNvqKzwhM29zAr5jl8HEo91bNMd03ce/M1jUx/W1jIoXFZ0iSS9gCxBSXGEC9JBF1tGpsbUPOM3iHTACG/phFxF+NyK//qUnGr943CJ54oEvM1N5dWx5+oa4HNvbR6fGkhdzio9904eKzJNo0EIKifCfbz5IKdqWZ0PSZgEIYYthFctb96N2+3/B38BUYfm1GsgAAAAAElFTkSuQmCC">
</div>
</template>

<style scoped>
.critique-pfp {
    border: var(--el-border);
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--el-border-radius-circle);
    flex-shrink: 0;
}

.critique-pfp > img {
    translate: -2px 0;
}
</style>