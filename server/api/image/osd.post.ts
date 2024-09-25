// post /api/image/ocr

import {workers} from "~/server/utils/tesseract";

/**
 * Request body:
 * {
 *     image: string (base64)
 * }
 *
 * Response body:
 * {
 *     success: boolean,
 *     data: {
 *         text: string
 *     }
 * }
 *
 * Process:
 *     1. Read the image
 *     2. Tesseract ocr
 *     3. Fix potential error with ChatGPT
 *     3. Return text
 */
export default defineEventHandler(async (event) => {
    const request = await readBody(event)
    const image = request.image

    const worker = (await workers).get()
    return await worker.osd(image)

    // TODO: vercel has some problems with tessaract, use pseudo value for now
    
    // return {
    //     "status": "success",
    //     "data": {
    //         "paragraphs": [
    //             {
    //                 "segments": [
    //                     {
    //                         "text": "A PEOPLE'S HISTORY OF THE UNITED STATES by Howard Zinn From Chapter 5: A KIND OF REVOLUTION",
    //                         "isLowConfidence": false
    //                     }
    //                 ]
    //             },
    //             {
    //                 "segments": [
    //                     {
    //                         "text": "The American victory over the British army was made possible by the existence of an already- armed people. Just about every white male had a gun, and could shoot. The Revolutionary leadership distrusted the mobs of poor. But they knew the Revolution had no appeal to slaves and Indians. They would have to woo the armed white population.",
    //                         "isLowConfidence": false
    //                     }
    //                 ]
    //             },
    //             {
    //                 "segments": [
    //                     {
    //                         "text": "This was not easy. Yes, mechanics and sailors, some others, were incensed against the British. But general enthusiasm for the war was not strong. While much of the white male population went into military service at one time or another during the war, only a small fraction stayed. John Shy, in his study of the Revolutionary army (A People Numerous and Armed), says they \"grew weary of being bullied by local committees of safety, by corrupt deputy assistant commissaries of supply, and by bands of ragged strangers with guns in their hands calling themselves soldiers of the",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "Revolution.\"",
    //                         "isLowConfidence": true
    //                     },
    //                     {
    //                         "text": "Shy estimates that perhaps a fifth of the population was actively treasonous. John Adams had estimated a third opposed, a third in support, a third neutral.",
    //                         "isLowConfidence": false
    //                     }
    //                 ]
    //             },
    //             {
    //                 "segments": [
    //                     {
    //                         "text": "Alexander Hamilton, an aide of George Washington and an up-and-coming member of the new elite, wrote from his headquarters:",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "\"... our",
    //                         "isLowConfidence": true
    //                     },
    //                     {
    //                         "text": "countrymen have all the folly of the ass and all the passiveness of the sheep... . They are determined not to be free.. . . If we are saved, France and Spain must save us.\"",
    //                         "isLowConfidence": false
    //                     }
    //                 ]
    //             },
    //             {
    //                 "segments": [
    //                     {
    //                         "text": "Slavery",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "got in",
    //                         "isLowConfidence": true
    //                     },
    //                     {
    //                         "text": "the way in the South. South Carolina, insecure since the slave uprising in Stono in 1739, could hardly fight against the",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "British;",
    //                         "isLowConfidence": true
    //                     },
    //                     {
    //                         "text": "her militia had to be used to keep slaves under control.",
    //                         "isLowConfidence": false
    //                     }
    //                 ]
    //             },
    //             {
    //                 "segments": [
    //                     {
    //                         "text": "The men who first joined the colonial militia were generally \"hallmarks of respectability or at least of",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "full citizenship”",
    //                         "isLowConfidence": true
    //                     },
    //                     {
    //                         "text": "in their communities, Shy says. Excluded from the militia were friendly Indians, free Negroes, white servants, and free white men who had no stable home. But desperation led to the recruiting of the less respectable whites. Massachusetts and Virginia provided for drafting",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "\"strollers\"",
    //                         "isLowConfidence": true
    //                     },
    //                     {
    //                         "text": "(vagrants) into the militia. In fact, the military became a place of promise for the poor, who might rise in rank, acquire some money, change their social status.",
    //                         "isLowConfidence": false
    //                     }
    //                 ]
    //             },
    //             {
    //                 "segments": [
    //                     {
    //                         "text": "Here was the traditional device by which those in charge of any social order mobilize and discipline a recalcitrant population- offering the adventure and rewards of military service to get poor people to fight for a cause they may not see clearly as their own. A wounded American lieutenant at Bunker Hill, interviewed by Peter Oliver, a Tory (who admittedly might have been looking for such a response), told how he had joined the rebel forces:",
    //                         "isLowConfidence": false
    //                     }
    //                 ]
    //             },
    //             {
    //                 "segments": [
    //                     {
    //                         "text": "I was a Shoemaker, & got my living by my Labor. When this Rebellion came on, I saw some of my Neighbors got into Commission, who were no better than myself. I was very ambitious, & did not like to see those Men above me. T was asked to enlist, as a private Soldier ... I offered to enlist upon having a Lieutenants Commission; which was granted. I imagined myself now in a way of Promotion: if I was killed in Battle, there would be an end of me, but if any Captain was",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "killed,",
    //                         "isLowConfidence": true
    //                     },
    //                     {
    //                         "text": "I should rise in Rank, & should still have a Chance to rise higher. These Sir! were the only Motives of my entering into the Service; for as to the Dispute between Great Britain & the Colonies, I know nothing of",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "it.",
    //                         "isLowConfidence": true
    //                     },
    //                     {
    //                         "text": "...",
    //                         "isLowConfidence": false
    //                     }
    //                 ]
    //             },
    //             {
    //                 "segments": [
    //                     {
    //                         "text": "John Shy investigated the subsequent experience of that Bunker Hill lieutenant. He was William Scott, of Peterborough, New Hampshire, and after a year as prisoner of the British he escaped, made his way back to the American army, fought in battles in New York, was captured again by the British, and escaped again by swimming the Hudson River one night with his sword tied around his neck and his watch pinned to his hat. He returned to New Hampshire, recruited a company of his own, including his two eldest sons, and fought in various battles, until his health gave way. He watched his eldest son die of camp fever after six years of service. He had sold his farm in Peterborough for a note that, with inflation, became worthless. After the war, he came to public attention when he rescued eight people from drowning after their boat turned over in New York harbor. He then got a job surveying western lands with the army, but caught a fever and died in 1796.",
    //                         "isLowConfidence": false
    //                     }
    //                 ]
    //             },
    //             {
    //                 "segments": [
    //                     {
    //                         "text": "Scott was one of many Revolutionary fighters, usually of lower military ranks, from poor and obscure backgrounds. Shy's study of the Peterborough contingent shows that the prominent and substantial citizens of the town had served only briefly in the war. Other",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "American",
    //                         "isLowConfidence": true
    //                     },
    //                     {
    //                         "text": "towns show the same pattern. As Shy puts it: \"Revolutionary America may have been a middle-class society, happier and more prosperous than any other in its time, but it contained a large and growing number of fairly poor people, and many of them did much of the actual fighting and suffering between 1775 and 1783: A very old",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "story.\"",
    //                         "isLowConfidence": true
    //                     }
    //                 ]
    //             },
    //             {
    //                 "segments": [
    //                     {
    //                         "text": "The military",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "conflict",
    //                         "isLowConfidence": true
    //                     },
    //                     {
    //                         "text": "itself, by dominating everything",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "in its",
    //                         "isLowConfidence": true
    //                     },
    //                     {
    //                         "text": "time, diminished other issues, made people choose sides in the one contest that was publicly important, forced people onto the side of the Revolution whose interest in Independence was not at all obvious. Ruling elites seem to have learned through the generations-consciously or not-that war makes them more secure against internal trouble.",
    //                         "isLowConfidence": false
    //                     }
    //                 ]
    //             },
    //             {
    //                 "segments": [
    //                     {
    //                         "text": "The force of military preparation had a way of pushing neutral people into line. In Connecticut, for instance, a law was passed requiring military service of all males between sixteen and sixty, omitting certain government officials, ministers, Yale students and faculty, Negroes, Indians, and mulattos. Someone called to duty could provide a substitute or get out of it by paying 5 pounds. When eighteen men failed to show up for military duty they were jailed and, in order to be released, had to pledge to fight in the war. Shy says: \"The mechanism of their political conversion was the",
    //                         "isLowConfidence": false
    //                     },
    //                     {
    //                         "text": "militia.\"",
    //                         "isLowConfidence": true
    //                     },
    //                     {
    //                         "text": "What looks like the democratization of the military forces in",
    //                         "isLowConfidence": false
    //                     }
    //                 ]
    //             }
    //         ],
    //         "confidence": 91
    //     },
    //     "timeMs": 10285.049699999974
    // }
})