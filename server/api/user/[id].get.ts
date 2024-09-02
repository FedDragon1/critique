// get /api/file/[id]

import { serverSupabaseClient } from "#supabase/server";
import {createClient} from "@supabase/supabase-js";

// TODO
export default defineEventHandler(async (event) => {
    const supabase = createClient(
        process.env.SUPABASE_URL as string,
        process.env.SUPABASE_KEY as string
    );
    supabase.from("user").select("*");
})

