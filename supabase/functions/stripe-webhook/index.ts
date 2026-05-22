import Stripe from "npm:stripe@14";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const PRICE_PLANO: Record<string, string> = {
  "price_1TZUWCJurcE85L58yJt335ho": "autonomo",
  "price_1TZj9FJurcE85L58BNSZMVpO": "mestre",
};

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing stripe-signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;

    if (!userId) {
      console.error("checkout.session.completed: missing user_id in metadata");
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const full = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items"],
    });

    const priceId = full.line_items?.data?.[0]?.price?.id ?? "";
    const plano = PRICE_PLANO[priceId] ?? "gratis";

    const { error } = await supabase
      .from("profiles")
      .update({ plano })
      .eq("id", userId);

    if (error) console.error("Error updating profile plano:", error);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
