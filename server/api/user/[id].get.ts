// get /api/user/[id]

import { serverSupabaseClient } from "#supabase/server";
import {createClient} from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
    const supabase = createClient(
        process.env.SUPABASE_URL as string,
        process.env.SUPABASE_KEY as string
    );
    supabase.from("user").select("*");
})

