<script setup lang="ts">
import ImageUploader from "~/components/uploading/ImageUploader.vue";
import {throttle} from "lodash-es";
import {useFileStore} from "~/stores/fileStore";
import {useTesseract} from "~/composibles/useTesseract";
import type {FourPoints} from "~/types/cvtypes";
import ForfeitDialog from "~/components/uploading/ForfeitDialog.vue";

const imageUploader = useTemplateRef<typeof ImageUploader>("imageUploader")

const returning = ref(false)
const imageLength = ref(0)
const uploading = ref(false)

const router = useRouter()
const fileStore = useFileStore()
const tesseract = await useTesseract(5)

function storeOcrResults(ocrResults: OcrResult[]) {
    const document: string[] = []

    ocrResults.forEach(ocrResult => ocrResult?.data?.paragraphs?.map(
        para => document.push(
            para.segments.map(
                segment => segment.isLowConfidence ? `[low-confidence]${segment.text}[/low-confidence]` : segment.text
            ).join(" ")
        )
    ))

    const textResult = document.map(p => `<p>${p}</p>`).join("\n")

    console.log(textResult)

    fileStore.setOcrResult(textResult)
}

async function ocr(osdResult: OsdResult) {
    const ocrResult = await tesseract.get().ocr(osdResult)
    if (ocrResult.status === "error") {
        ElMessage.error(ocrResult.errorMessage)
        throw Error(ocrResult.errorMessage)
    }
    if (ocrResult.status === "warning") {
        ElMessage.warning(ocrResult.warningMessage)
    }
    return ocrResult
}

async function osd(image: string): Promise<OsdResult> {
    const osdResult: OsdResult = await $fetch("/api/image/osd", {
        method: "POST",
        body: {image}
    });
    if (osdResult.status === "error") {
        ElMessage.error(osdResult.errorMessage)
        throw Error(osdResult.errorMessage)
    }
    if (osdResult.status === "warning") {
        ElMessage.warning(osdResult.warningMessage)
    }
    return osdResult
}

async function perspective(image: string, contour: FourPoints): Promise<string> {
    const resp = await $fetch("/api/image/transform", {
        method: "POST",
        body: {
            points: contour,
            image: image
        }
    })
    if (!resp.success) {
        ElMessage.error("Error converting the perspective of image")
    }
    return resp.data.png
}

/**
 * For each image, do:
 *  1. adjust the perspective (opencv backend)
 *  2. osd (opencv backend)
 *  3. ocr (tesseract frontend)
 */
async function uploadImages() {
    // const a = `{"status":"success","timeMs":18019.600000023842,"data":{"paragraphs":[{"segments":[{"text":"A PEOPLE'S HISTORY OF THE UNITED STATES","isLowConfidence":false},{"text":"by","isLowConfidence":true},{"text":"Howard Zinn","isLowConfidence":false},{"text":"From","isLowConfidence":true},{"text":"Chapter","isLowConfidence":false},{"text":"5:","isLowConfidence":true},{"text":"A KIND OF REVOLUTION","isLowConfidence":false}]},{"segments":[{"text":"The American victory over the British army was made possible by the existence of an already- armed people. Just about every white male had a gun, and could shoot. The Revolutionary leadership distrusted the mobs of poor. But they knew the Revolution had no appeal to slaves and Indians. They would have to woo the armed white population.","isLowConfidence":false}]},{"segments":[{"text":"This was not easy. Yes, mechanics and sailors, some others, were incensed against the British. But general enthusiasm for the war was not","isLowConfidence":false},{"text":"strong.","isLowConfidence":true},{"text":"While much of the white male population went into military service at one time or another during the war, only a small fraction stayed. John Shy, in his study of the Revolutionary","isLowConfidence":false},{"text":"army","isLowConfidence":true},{"text":"(A People Numerous and Armed), says they \\"grew weary of being bullied by local committees of safety, by corrupt deputy assistant commissaries of supply, and by bands of ragged strangers with guns in their hands calling themselves soldiers of the","isLowConfidence":false},{"text":"Revolution.”","isLowConfidence":true},{"text":"Shy estimates that perhaps a fifth of the population was actively treasonous. John Adams had estimated a third opposed, a third in support, a third","isLowConfidence":false},{"text":"neutral.","isLowConfidence":true}]},{"segments":[{"text":"Alexander Hamilton, an aide of George Washington and an up-and-coming member of the new elite, wrote from his headquarters:","isLowConfidence":false},{"text":"\\", ..","isLowConfidence":true},{"text":"our countrymen have","isLowConfidence":false},{"text":"all the","isLowConfidence":true},{"text":"folly of the ass and all the passiveness of the sheep... . They are determined not to be free..","isLowConfidence":false},{"text":". .","isLowConfidence":true},{"text":"If we are saved, France and Spain must save","isLowConfidence":false},{"text":"us.\\"”","isLowConfidence":true}]},{"segments":[{"text":"Slavery","isLowConfidence":false},{"text":"got in","isLowConfidence":true},{"text":"the way in the South. South Carolina, insecure since the slave uprising in Stono in 1739, could hardly fight against the British; her militia had to be used to keep slaves under control.","isLowConfidence":false}]},{"segments":[{"text":"The men who first joined the colonial militia were generally \\"hallmarks of respectability or at","isLowConfidence":false},{"text":"least","isLowConfidence":true},{"text":"of full","isLowConfidence":false},{"text":"citizenship\\"","isLowConfidence":true},{"text":"in their communities, Shy says. Excluded from the militia were friendly Indians, free Negroes, white servants, and free white men who had no stable home. But desperation led to the recruiting of the less respectable","isLowConfidence":false},{"text":"whites,","isLowConfidence":true},{"text":"Massachusetts and Virginia provided for drafting","isLowConfidence":false},{"text":"“strollers”","isLowConfidence":true},{"text":"(vagrants) into the militia. In fact, the military became a place of promise for the poor, who might rise in rank, acquire some money, change their social status.","isLowConfidence":false}]},{"segments":[{"text":"Here was the traditional device by which those in charge of any social order mobilize and discipline a","isLowConfidence":false},{"text":"recalcitrant","isLowConfidence":true},{"text":"population- offering the adventure and rewards of","isLowConfidence":false},{"text":"military","isLowConfidence":true},{"text":"service to get poor people to fight for a cause they may not see","isLowConfidence":false},{"text":"clearly","isLowConfidence":true},{"text":"as their","isLowConfidence":false},{"text":"own.","isLowConfidence":true},{"text":"A wounded American","isLowConfidence":false},{"text":"lieutenant","isLowConfidence":true},{"text":"at Bunker Hill, interviewed by Peter Oliver, a Tory (who admittedly might have been looking for such a response), told how he had joined the rebel forces:","isLowConfidence":false},{"text":"¥","isLowConfidence":true},{"text":"was a Shoemaker, & got my living by my Labor. When this Rebellion came on, I saw some of my Neighbors got into Commission, who were no better than myself. I was very","isLowConfidence":false},{"text":"ambitious,","isLowConfidence":true},{"text":"& did not like to see those Men above me. T was asked to enlist, as a private Soldier ... I offered to enlist upon having a","isLowConfidence":false},{"text":"Lieutenants","isLowConfidence":true},{"text":"Commission; which was granted. I imagined myself now in a way of Promotion: if I was","isLowConfidence":false},{"text":"killed","isLowConfidence":true},{"text":"in Battle, there would be an end of me, but if any Captain was killed,","isLowConfidence":false},{"text":"X","isLowConfidence":true},{"text":"should rise in Rank, & should still have a Chance to rise higher. These Sir! were the only Motives of my entering into the Service; for as to the Dispute between Great Britain & the Colonies, I know nothing of","isLowConfidence":false},{"text":"it.","isLowConfidence":true},{"text":"...","isLowConfidence":false}]},{"segments":[{"text":"John Shy investigated the subsequent experience of that Bunker Hill","isLowConfidence":false},{"text":"lieutenant.","isLowConfidence":true},{"text":"He was William Scott, of Peterborough, New Hampshire, and after a year as prisoner of the British he escaped, made his way back to the American army, fought in battles in New York, was captured again by the","isLowConfidence":false},{"text":"British,","isLowConfidence":true},{"text":"and escaped again by swimming the Hudson River one night with his sword tied around his neck and his watch pinned to his","isLowConfidence":false},{"text":"hat.","isLowConfidence":true},{"text":"He returned to New Hampshire,","isLowConfidence":false},{"text":"recruited","isLowConfidence":true},{"text":"a company of his own, including his two eldest sons, and fought in various battles, until his health gave way. He watched","isLowConfidence":false},{"text":"his","isLowConfidence":true},{"text":"eldest son die of camp fever after six years of service. He had sold his farm in Peterborough for a note that, with inflation, became","isLowConfidence":false},{"text":"worthless.","isLowConfidence":true},{"text":"After the war, he came to public attention when he rescued eight people from drowning after their boat turned over in New York harbor. He then got a job surveying western lands with the army, but caught a fever and died in 1796.","isLowConfidence":false}]},{"segments":[{"text":"Scott was one of many Revolutionary fighters,","isLowConfidence":false},{"text":"usually","isLowConfidence":true},{"text":"of lower military ranks, from poor and obscure backgrounds. Shy's study of the","isLowConfidence":false},{"text":"Peterborough","isLowConfidence":true},{"text":"contingent shows that the prominent and substantial citizens of the town had served only briefly in the war. Other","isLowConfidence":false},{"text":"American","isLowConfidence":true},{"text":"towns show the same pattern. As Shy puts it: \\"Revolutionary America may have been a middle-class society, happier and more prosperous than any other","isLowConfidence":false},{"text":"in its","isLowConfidence":true},{"text":"time, but it contained a large and growing number of fairly poor people, and many of them did much of the actual fighting and suffering between 1775 and 1783: A very old story.\\"","isLowConfidence":false}]},{"segments":[{"text":"The military conflict itself, by dominating everything in its time, diminished other issues, made people choose sides in the one contest that was publicly important, forced people onto the side of the Revolution whose interest in Independence was not at all obvious. Ruling elites seem to have learned through the generations-consciously or not-that war makes them more secure against internal trouble.","isLowConfidence":false}]},{"segments":[{"text":"The force of military preparation had a way of pushing neutral people into","isLowConfidence":false},{"text":"line,","isLowConfidence":true},{"text":"In Connecticut, for instance, a law was passed requiring military service of all males between sixteen and sixty, omitting certain government officials, ministers, Yale students and faculty, Negroes, Indians, and mulattos. Someone called to duty could provide a substitute or get out of it by paying 5 pounds. When eighteen men failed to show up for military duty they were jailed and, in order to be released, had to pledge to fight in the war. Shy says: \\"The mechanism of their political conversion was the","isLowConfidence":false},{"text":"militia.\\"","isLowConfidence":true},{"text":"What looks like the democratization of the military forces in","isLowConfidence":false}]}],"confidence":90}}`
    // return [JSON.parse(a), JSON.parse(a)]

    const promises: Promise<OcrResult>[] = []
    for (const item of imageUploader.value?.items()) {
        const promise = perspective(item.image, item.contour)
            .then(osd)
            .then(ocr)
        promises.push(promise)
    }
    return Promise.all(promises)
}

function returnGuard() {
    if (imageLength.value === 0) {
        router.push("/")
        return
    }
    returning.value = true
}

function continueReviewRaw() {
    if (imageLength.value === 0) {
        ElMessage.error("No images")
        return
    }

    uploading.value = true

    // TODO: add loading bar during ocr

    uploadImages().then((resp) => {
        storeOcrResults(resp)

        uploading.value = false;
        imageUploader.value?.clearImages()
        returning.value = false
        router.push('/analytic/review')
    }).finally(() => uploading.value = false)
}

function forfeit() {
    imageUploader.value?.clearImages()
    returning.value = false
    router.push("/")
}

const continueReview = throttle(continueReviewRaw, 2000)
</script>

<template>
    <DashboardFrame activate="/analytic" padding="0px" style="display: flex; flex-direction: column;">
        <UploadingNav title="New Critique File" @return="returnGuard"
                      @continue="continueReview" :disable-continue="uploading" ></UploadingNav>
        <div class="page-wrapper">
            <div class="frame">
                <ImageUploader @image-change="(i) => imageLength = i"
                               ref="imageUploader"
                               class="upload-wrapper"/>
            </div>
        </div>
        <ForfeitDialog :before-close="() => returning = false"
                       :returning="returning"
                       @cancel="returning = false"
                       @confirm="forfeit" />
    </DashboardFrame>
</template>

<style scoped>
.upload-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    margin-left: auto;
    margin-right: auto;
    max-width: 950px;
}

.frame {
    flex-grow: 9999;
    height: 100%;
}

.page-wrapper {
    flex-grow: 999;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>