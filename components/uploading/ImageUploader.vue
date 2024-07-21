<script setup lang="ts">
import UploadImage from "~/components/uploading/UploadImage.vue";
import ImageSingle from "~/components/uploading/ImageSingle.vue";
import UploadButton from "~/components/uploading/UploadButton.vue";

function useUploadRef(value: any) {
  return customRef((track: () => void, trigger: () => void) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        trigger()

        // filter the newValue
        if (!Array.isArray(newValue)) {
          return;
        }

        const filtered = newValue.filter(p => p.constructor === ImgProxy)
        if (filtered.length === value.length && filtered.map((p, i) => p.image === value[i].image).reduce((a, b) => a && b, true)) {
          // the array did not change after removing invalid elements
          return;
        }
        value = filtered
      }
    }
  })
}

class ImgProxy {
  image
  canny
  index
  hash

  constructor(image: string, canny: string, index: number) {
    this.image = image
    this.canny = canny
    this.index = index
    this.hash = Math.random().toString(36).slice(2, 7)
  }

  get url(): string {
    return `data:image/png;base64,${this.image}`
  }

  set url(newValue: string) {
    console.log(newValue)
  }
}

const attrs = useAttrs();
const images = useUploadRef([])
const tempImage = ref<string>()
const switching = ref()
const currentSlide = ref(0)

const storeImage = (file: File) => {
  if (tempImage.value) {
    ElMessage.error("Please wait for the current image to be uploaded")
  }
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    tempImage.value = (reader.result as string).split(',')[1]
  }
}

const submitted = (resp: any) => {
  if (!tempImage.value) {
    throw TypeError("No file is found")
  }
  images.value = [...images.value, new ImgProxy(tempImage.value!, resp.data.png, images.value.length)]
  tempImage.value = undefined
  currentSlide.value = images.value.length - 1
}

function switchImage(resp: any) {
  if (!tempImage.value) {
    throw TypeError("No file is found")
  }
  const newValue = [...images.value]
  newValue[switching.value] = new ImgProxy(tempImage.value!, resp.data.png, switching.value)
  images.value = newValue
  tempImage.value = undefined
  currentSlide.value = switching.value
}

function handlePreview(p: any) {
  const img = p as ImgProxy
  currentSlide.value = img.index
}

function handleRemove() {
  images.value = images.value.forEach((p: ImgProxy, i: number) => p.index = i)
  currentSlide.value = Math.min(currentSlide.value, images.value.length ?? 0)
}

function handleDelete() {
  const firstHalf = images.value.slice(0, currentSlide.value)
  const secondHalf = images.value.slice(currentSlide.value + 1)
  secondHalf.forEach((p: ImgProxy) => p.index--)
  images.value = [...firstHalf, ...secondHalf]
  currentSlide.value = Math.min(currentSlide.value, images.value.length ?? 0)
}
</script>

<template>
  <div class="upload" v-bind="attrs">
    <div class="gallery">
      <el-button class="move-page" :disabled="currentSlide === 0" @click="currentSlide--">
        <el-icon>
          <el-icon-ArrowLeftBold/>
        </el-icon>
      </el-button>
      <div>
        <template v-for="({image, canny, hash}, i) in images" :key="`${hash}`">
          <KeepAlive>
            <ImageSingle
                v-if="currentSlide === i"
                class="image"
                :image="image"
                :canny="canny"></ImageSingle>
          </KeepAlive>
        </template>

        <div class="footer" v-if="currentSlide !== images.length">
          <span>
            <em>{{ currentSlide + 1 }}</em> of {{ images.length }} Picture(s)
          </span>
          <div class="operations">
            <el-button class="delete" plain @click="handleDelete">
              <el-icon>
                <el-icon-Delete/>
              </el-icon>
            </el-button>
            <UploadButton @success="switchImage" @upload="(f) => {switching = currentSlide; storeImage(f)}" >
              <el-icon>
                <el-icon-Switch/>
              </el-icon>
            </UploadButton>
          </div>
        </div>

        <KeepAlive>
          <UploadImage @success="submitted" @upload="storeImage" v-if="currentSlide === images.length"></UploadImage>
        </KeepAlive>
      </div>
      <el-button class="move-page" :disabled="currentSlide === images.length" @click="currentSlide++">
        <el-icon>
          <el-icon-ArrowRightBold/>
        </el-icon>
      </el-button>
    </div>
    <div class="preview">
      <el-upload
          v-model:file-list="images"
          action="/api/image/scan"
          list-type="picture-card"
          :on-success="submitted"
          :before-upload="storeImage"
          :on-preview="handlePreview"
          :on-remove="handleRemove">
        <el-icon><el-icon-Plus /></el-icon>
      </el-upload>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-upload-list--picture-card .el-upload-list__item-thumbnail) {
  object-fit: cover !important;
}

.upload {
  max-width: 80vw;
  gap: 20px;
}

.move-page {
  border-radius: 50%;
  height: 30px;
  width: 30px;
}

.gallery {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-grow: 9999;
  height: 100%;
}

.preview {
  width: 148px;
  height: 100%;
  border: 1px solid var(--el-border-color);
  overflow-y: auto;
  overflow-x: hidden;
}

.image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operations {
  display: flex;
  gap: 10px;
}

.delete {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: color 0.2s ease-in-out, border 0.2s ease-in-out;
}

.delete:hover {
  --el-button-hover-text-color: var(--el-color-danger) !important;
  --el-button-hover-border-color: var(--el-color-danger) !important;
}
</style>