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

// supabase redirects the email confirmation to index page
// we'll need to deal with it here
const route = useRoute()
const router = useRouter()

if (route.query.error) {
    ElMessage.error(route.query.error_description as string)
    router.push("/register")
}

if (route.query.code) {
    ElMessage.success("Account Verified!")
    router.push("/login")
}

</script>

<template>
<div class="wrapper">
  <div class="screen-wrapper">
    <div class="header-wrapper">
      <img src="@/assets/homepage/books.png" alt="books" class="books">
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
          <NuxtLink style="--clr: #7808d0" class="button" to="/register">
          <span class="button__icon-wrapper">
            <svg
                width="10"
                class="button__icon-svg"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 15"
            >
              <path
                  fill="currentColor"
                  d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
              ></path>
            </svg>

            <svg
                class="button__icon-svg button__icon-svg--copy"
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                fill="none"
                viewBox="0 0 14 15"
            >
              <path
                  fill="currentColor"
                  d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
              ></path>
            </svg>
          </span>
            Get Started Now
          </NuxtLink>
        </div>
      </header>
    </div>
    <div class="book-decoration">
      <img src="@/assets/homepage/book_flipping.png" alt="book flipping" class="book-flipping">
      <img src="@/assets/homepage/pencil_feather.png" alt="pencil feather" class="pencil-feather">
    </div>

    <img src="@/assets/homepage/dots.png" alt="dots" class="dots">
    <img src="@/assets/homepage/scribble.png" alt="scribble">
  </div>
  <IndexNav></IndexNav>
</div>
</template>

<style scoped>
.button {
  border: 1px solid transparent;
  line-height: 1;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--el-color-danger); /* Changed to red color before hover */
  color: var(--el-color-white); /* Changed text color to white before hover */
  border-radius: 10rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem 0.75rem 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
      background-color 0.3s,
      color 0.3s; /* Added color transition */
  font-family: "Nunito Sans", sans-serif; /* Changed font to Nunito Sans */
}

.button__icon-wrapper {
  flex-shrink: 0;
  width: 25px;
  height: 25px;
  position: relative;
  color: var(--el-color-danger); /* Changed icon wrapper color to red before hover */
  background-color: var(--el-color-white); /* Changed icon wrapper background to white before hover */
  border-radius: 50%;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.button:hover {
  background-color: var(--el-color-white); /* Changed to white color on hover */
  color: var(--el-color-danger); /* Changed text color to red on hover */
  border: 1px solid var(--el-color-danger)
}

.button:hover .button__icon-wrapper {
  color: var(--el-color-white); /* Changed icon wrapper color to white on hover */
  background-color: var(--el-color-danger); /* Changed icon wrapper background to red on hover */
}

.button__icon-svg--copy {
  position: absolute;
  transform: translate(-150%, 150%);
}

.button:hover .button__icon-svg:first-child {
  transition: transform 0.3s ease-in-out;
  transform: translate(150%, -150%);
}

.button:hover .button__icon-svg--copy {
  transition: transform 0.3s ease-in-out 0.1s;
  transform: translate(0);
}

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
  top: 23%;
  left: -180px;
}

.book-decoration {
  position: absolute;
  left: 50%;
  top: 25%;
}

.book-flipping, .pencil-feather {
  max-height: 60vh;
  max-width: 50vw;
}

.pencil-feather {
  right: -20%;
  position: absolute;
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

.wrapper {
  width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  user-select: none;
}

.header-wrapper {
  height: 100vh;
  display: flex;
  position: absolute;
  left: 20%;
  user-select: none;
  align-items: center;
}

header {
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  gap: 26px;
}
</style>