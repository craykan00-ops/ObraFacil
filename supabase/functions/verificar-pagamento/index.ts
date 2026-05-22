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
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authErr || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    // Busca cliente no Stripe pelo e-mail
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ plano: "gratis", msg: "Nenhum cliente Stripe encontrado" }), { status: 200 });
    }

    const customerId = customers.data[0].id;

    // Busca assinaturas ativas
    const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1, expand: ["data.items.data.price"] });

    let plano = "gratis";
    if (subs.data.length > 0) {
      const priceId = subs.data[0].items.data[0].price.id;
      plano = PRICE_PLANO[priceId] ?? "gratis";
    } else {
      // Verifica checkout sessions recentes (pagamento único / trial)
      const sessions = await stripe.checkout.sessions.list({ customer: customerId, limit: 5, expand: ["data.line_items"] });
      for (const s of sessions.data) {
        if (s.payment_status === "paid") {
          const priceId = s.line_items?.data?.[0]?.price?.id ?? "";
          if (PRICE_PLANO[priceId]) { plano = PRICE_PLANO[priceId]; break; }
        }
      }
    }

    // Atualiza o banco
    await supabase.from("profiles").update({ plano }).eq("id", user.id);

    return new Response(JSON.stringify({ plano }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
