import {defineStore} from 'pinia'
import type {User} from "@supabase/auth-js";
import type {BaseResponse, UserPostRequest} from "~/types/requests";
import {SupabaseClient} from "@supabase/supabase-js";

export const useUserStore = defineStore('user', {
    state: () => ({
        userAuth: undefined as User | undefined,
        userInfo: undefined as CritiqueUser | undefined,
    }),
    getters: {
        getUserAuth(): User | undefined {
            return this.userAuth
        },
        async getUserInfo(): Promise<CritiqueUser | undefined> {
            if (!this.userAuth) {
                return undefined
            }
            if (!this.userInfo || this.userInfo.uuid !== this.userAuth.id) {
                let resp = await $fetch<BaseResponse<CritiqueUser>>(`/api/user/${this.userAuth.id}`);
                if (!resp.success) {
                    // no user with userAuth == OAuth
                    // should append user into the database
                    const postBody: UserPostRequest = {
                        name: this.userAuth.user_metadata.name ?? "Critique User",
                        uuid: this.userAuth.id,
                        avatar: this.userAuth?.user_metadata?.avatar_url
                    }
                    const append = await $fetch("/api/user", {
                        method: "POST",
                        body: postBody
                    })
                    if (!append.success) {
                        throw Error(append.errorMessage)
                    }
                    resp = append
                }
                this.userInfo = resp.data
            }
            return this.userInfo
        }
    },
    actions: {
        setUserAuth(to: User) {
            this.$patch(state => state.userAuth = to)
        },
        setUserInfo(to: CritiqueUser) {
            this.$patch(state => state.userInfo = to)
        },
        clear() {
            this.$patch(state => {
                state.userAuth = undefined
                state.userInfo = undefined
            })
        },
        async getUserAvatar(client: SupabaseClient): Promise<string | undefined> {
            if (!this.userAuth) {
                return undefined}
            if (!this.userInfo) {
                if (!await this.getUserInfo) {
                    return undefined;
                }
            }
            const externalLink = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&\/=]*)/
            if (this.userInfo!.avatar.match(externalLink)) {
                return this.userInfo!.avatar
            }
            const { data } = client.storage.from("avatar").getPublicUrl(this.userInfo!.avatar);
            return data.publicUrl
        }
    }
})