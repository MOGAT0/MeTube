import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req:Request) {
    const SIGNING_SECRET = process.env.SIGNING_SECRET;

    if(!SIGNING_SECRET){
        throw new Error('Error: add signing secret to env');
    };

    const wh = new Webhook(SIGNING_SECRET);

    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if(!svix_id || !svix_timestamp || !svix_signature){
        return new Response('Error: Missing Svix Header',{
            status:400,
        })
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    let evt: WebhookEvent
    try {
        evt = wh.verify(body,{
           'svix-id':svix_id, 
           'svix-timestamp':svix_timestamp, 
           'svix-signature':svix_signature, 
        }) as WebhookEvent
    } catch (error) {
        console.log("Error: could not verify webhook", error);
        return new Response('verification error',{
            status:400,
        })
    }

    const eventType = evt.type;
    
    if(eventType == "user.created"){

        const { data } = evt;

        const name = data.first_name ? data.first_name : data.email_addresses[0].email_address

        await db.insert(users).values({
            clerkId: data.id,
            name: `${name} ${data.last_name}`,
            imageUrl: data.image_url,
        })
    }

    if(eventType == "user.deleted"){
        const { data } = evt;

        if(!data.id){
            throw new Response("Error: Unable to access data ID",{
                status:400,
            })
        }

        await db.delete(users).where(eq(users.clerkId, data.id));
    }

    if(eventType == "user.updated"){
        const { data } = evt;
        const name = data.first_name ? data.first_name : data.email_addresses[0].email_address
        await db
        .update(users)
        .set({
            name: `${name} ${data.last_name}`,
            imageUrl: data.image_url,
        })
        .where(eq(users.clerkId, data.id));
    }

    return new Response('Webhook recieved', {status:200});

}