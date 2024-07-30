<script setup lang="ts">
import IndexNav from "~/components/homepage/IndexNav.vue";

definePageMeta({
  middleware: 'login-redirect'
})

useSeoMeta({
  title: "Critique | The AI Critical Read Helper",
  ogTitle: "Critique | The AI Critical Read Helper",
  description: "Critique is the next generation rich text editor powered by AI. Scan, uploading, and critically read " +
      "with AI summary, tone and sentiment analysis, argument and structure analysis, key question generation in an " +
      "interactive and productive manner.",
  ogDescription: "The next generation rich text editor powered by AI. Scan, uploading, and critically read with AI " +
      "summary, tone and sentiment analysis, argument and structure analysis, key question generation in an " +
      "interactive and productive manner.",
  ogImage: `https://critique-neon.vercel.app/android-chrome-512x512.png`
})
</script>

<template>
<div class="wrapper">
  <div class="screen-wrapper">
    <header>
      <h1 class="heading">
        Unlock The Power Of<br>
        Critical Thinking With<br>
        <span class="name">Critique AI</span>
      </h1>
      <span class="detail">
      Critique uses cutting-edge AI technology to<br>
      enhance reading comprehension and analytical<br>
      skills, preparing you for a successful future.
    </span>
      <div>
        <NuxtLink to="/register" class="register">Get Started Now</NuxtLink>
      </div>
    </header>

    <div class="book-decoration">
      <img src="@/assets/homepage/book_flipping.png" alt="book flipping" class="book-flipping">
      <img src="@/assets/homepage/pencil_feather.png" alt="pencil feather" class="pencil-feather">
    </div>

    <img src="@/assets/homepage/books.png" alt="books" class="books">
    <img src="@/assets/homepage/dots.png" alt="dots" class="dots">
    <img src="@/assets/homepage/scribble.png" alt="scribble">
  </div>
  <IndexNav></IndexNav>
</div>
</template>

<style scoped>
.screen-wrapper {
  height: 100vh;
  position: relative;
}

.dots {
  position: absolute;
  bottom: 0;
}

.books {
  width: 150px;
  position: absolute;
  top: 20%;
  left: 8%;
}

.book-decoration {
  position: absolute;
  left: 50%;
  top: 30%;
}

.book-flipping, .pencil-feather {
  max-height: 50vh;
  max-width: 30vw;
}

.pencil-feather {
  left: -33%;
  position: relative;
  z-index: -1;
}

.name {
  color: var(--el-color-primary);
}

.detail {
  line-height: 1.8rem;
}

.heading {
  font-family: var(--poppins), sans-serif;
  padding: 0;
  margin: 0;
  font-size: 42px;
}

.register {
  background-color: var(--el-color-primary);
  padding: 16px 32px;
  border-radius: var(--el-border-radius-round);
  color: var(--el-color-white);
  text-decoration: none;
  user-select: none;
  cursor: pointer;
  display: inline-block;
  border: 1px solid transparent;
  transition: 0.2s ease-in-out;
}

.register:hover {
  background-color: initial;
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary);
}

.wrapper {
  width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  user-select: none;
}

header {
  display: flex;
  flex-direction: column;
  position: absolute;
  gap: 26px;
  left: 20%;
  top: 30%;
  user-select: none;
}
</style>