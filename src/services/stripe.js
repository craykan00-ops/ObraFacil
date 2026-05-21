// ============================================================
// OBRAFÁCIL — INTEGRAÇÃO STRIPE COMPLETA
// Arquivo: src/services/stripe.js
// ============================================================

import { useStripe } from "@stripe/stripe-react-native";
import { Alert } from "react-native";

// ── CONFIGURAÇÃO ──────────────────────────────────────────
export const STRIPE_KEY = "pk_test_51TZR6OJurcE85L58G8OWGuEusUZNrG3da4GkJZdH3R41MHnbVQyNjp2XbkAVocVdj3FK3lyBpZxilpfpHsEYhWIq001dx17Neh";

export const PLANOS = {
  autonomo: {
    nome:    "Plano Autônomo",
    preco:   "R$ 47/mês",
    priceId: "price_1TZUWCJurcE85L58yJt335ho",
    recursos: [
      "3 obras simultâneas",
      "Até 3 funcionários",
      "Checklist + fotos",
      "5 orçamentos/mês",
      "Controle de estoque",
    ],
  },
  mestre: {
    nome:    "Plano Mestre",
    preco:   "R$ 97/mês",
    priceId: "price_1TZUWsJurcE85L58IlSTt906",
    recursos: [
      "Obras ilimitadas",
      "Até 15 funcionários",
      "Orçamentos ilimitados + PDF",
      "Financeiro completo",
      "Relatórios e gráficos",
    ],
  },
};

// ── INICIALIZAR STRIPE NO APP ─────────────────────────────
// Cole isso no seu App.js ou _layout.tsx:
//
// import { initStripe } from "@stripe/stripe-react-native";
// import { STRIPE_KEY } from "./src/services/stripe";
//
// useEffect(() => {
//   initStripe({
//     publishableKey: STRIPE_KEY,
//     merchantIdentifier: "merchant.com.obrafacil",
//   });
// }, []);


// ============================================================
// TELA DE PLANOS — Cole em src/screens/PlanosScreen.jsx
// ============================================================

import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "./supabase";

const T = {
  amarelo:    "#C77700",
  amareloC:   "#FFF3DC",
  fundo:      "#F5F5F0",
  fundoCard:  "#FFFFFF",
  cinza1:     "#1A1A1A",
  cinza2:     "#4A4A4A",
  cinza3:     "#8A8A8A",
  cinzaBorda: "#E0E0D8",
  verde:      "#2E7D32",
  verdeC:     "#E8F5E9",
};

export default function PlanosScreen({ navigation }) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(null);
  const [planoSelecionado, setPlanoSelecionado] = useState("autonomo");

  // ── PASSO 1: Buscar o PaymentIntent do backend ──────────
  async function buscarPaymentIntent(priceId) {
    // Aqui você chama sua API/backend para criar o PaymentIntent
    // Por enquanto usamos uma Edge Function do Supabase
    const { data, error } = await supabase.functions.invoke("criar-pagamento", {
      body: { priceId },
    });

    if (error) throw error;
    return data; // retorna { paymentIntent, ephemeralKey, customer }
  }

  // ── PASSO 2: Abrir o checkout do Stripe ─────────────────
  async function handleAssinar(planoId) {
    const plano = PLANOS[planoId];
    setLoading(planoId);

    try {
      // 1. Busca o PaymentIntent
      const { paymentIntent, ephemeralKey, customer } =
        await buscarPaymentIntent(plano.priceId);

      // 2. Inicializa o Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName:       "ObraFácil",
        customerId:                customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: { name: "Mestre" },
      });

      if (initError) throw initError;

      // 3. Abre a tela de pagamento
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== "Canceled") {
          Alert.alert("Erro no pagamento", paymentError.message);
        }
        return;
      }

      // 4. Pagamento aprovado!
      Alert.alert(
        "🎉 Pagamento aprovado!",
        `Bem-vindo ao ${plano.nome}! Seu acesso já está liberado.`,
        [{ text: "Começar", onPress: () => navigation.replace("Dashboard") }]
      );

    } catch (error) {
      Alert.alert("Erro", "Não foi possível processar o pagamento. Tente novamente.");
      console.error(error);
    } finally {
      setLoading(null);
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Escolha seu plano</Text>
        <Text style={styles.headerSub}>
          Menos que 1 hora de pedreiro por mês
        </Text>
      </View>

      {/* PLANO GRÁTIS */}
      <View style={[styles.card, styles.cardGratis]}>
        <Text style={styles.planNome}>🪚 Grátis</Text>
        <Text style={styles.planPrecoGratis}>R$ 0</Text>
        <Text style={styles.planPeriodo}>para sempre</Text>
        <View style={styles.divisor} />
        {["1 obra ativa", "Checklist básico", "Até 2 funcionários"].map((r, i) => (
          <View key={i} style={styles.recursoRow}>
            <Text style={styles.recursoCheck}>✓</Text>
            <Text style={styles.recursoTxt}>{r}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.btnGratis}>
          <Text style={styles.btnGratisTxt}>Continuar no grátis</Text>
        </TouchableOpacity>
      </View>

      {/* PLANO AUTÔNOMO */}
      <View style={[styles.card, styles.cardDestaque]}>
        <View style={styles.popularBadge}>
          <Text style={styles.popularTxt}>⭐ Mais popular</Text>
        </View>
        <Text style={[styles.planNome, { color: T.amarelo }]}>🔨 Autônomo</Text>
        <View style={styles.precoRow}>
          <Text style={styles.planPrecoCifrao}>R$</Text>
          <Text style={[styles.planPreco, { color: T.amarelo }]}>47</Text>
        </View>
        <Text style={styles.planPeriodo}>/mês</Text>
        <View style={styles.divisor} />
        {PLANOS.autonomo.recursos.map((r, i) => (
          <View key={i} style={styles.recursoRow}>
            <Text style={[styles.recursoCheck, { color: T.amarelo }]}>✓</Text>
            <Text style={[styles.recursoTxt, { color: T.cinza1, fontWeight: "600" }]}>{r}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={styles.btnAssinar}
          onPress={() => handleAssinar("autonomo")}
          disabled={loading === "autonomo"}
        >
          {loading === "autonomo"
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnAssinarTxt}>Assinar agora →</Text>
          }
        </TouchableOpacity>
      </View>

      {/* PLANO MESTRE */}
      <View style={[styles.card, { marginBottom: 40 }]}>
        <Text style={styles.planNome}>👑 Mestre</Text>
        <View style={styles.precoRow}>
          <Text style={styles.planPrecoCifrao}>R$</Text>
          <Text style={styles.planPreco}>97</Text>
        </View>
        <Text style={styles.planPeriodo}>/mês</Text>
        <View style={styles.divisor} />
        {PLANOS.mestre.recursos.map((r, i) => (
          <View key={i} style={styles.recursoRow}>
            <Text style={styles.recursoCheck}>✓</Text>
            <Text style={styles.recursoTxt}>{r}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={[styles.btnAssinar, { backgroundColor: T.cinza1 }]}
          onPress={() => handleAssinar("mestre")}
          disabled={loading === "mestre"}
        >
          {loading === "mestre"
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnAssinarTxt}>Assinar agora →</Text>
          }
        </TouchableOpacity>
      </View>

      {/* GARANTIAS */}
      <View style={styles.garantias}>
        {["Cancele quando quiser", "Sem multa de cancelamento", "Suporte em português"].map((g, i) => (
          <Text key={i} style={styles.garantiaTxt}>✓ {g}</Text>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: T.fundo },
  header:          { padding: 28, paddingTop: 60, alignItems: "center" },
  headerTitulo:    { fontSize: 26, fontWeight: "800", color: T.cinza1, marginBottom: 8 },
  headerSub:       { fontSize: 15, color: T.cinza3, textAlign: "center" },
  card:            { margin: 16, marginBottom: 12, backgroundColor: T.fundoCard, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: T.cinzaBorda, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardGratis:      { borderColor: T.cinzaBorda },
  cardDestaque:    { borderColor: T.amarelo, backgroundColor: "#FFFBF0", shadowColor: T.amarelo, shadowOpacity: 0.15 },
  popularBadge:    { backgroundColor: T.amarelo, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, alignSelf: "center", marginBottom: 14 },
  popularTxt:      { color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  planNome:        { fontSize: 22, fontWeight: "800", color: T.cinza1, marginBottom: 8, letterSpacing: 1 },
  precoRow:        { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  planPrecoCifrao: { fontSize: 18, color: T.cinza2, fontWeight: "600", marginBottom: 6 },
  planPreco:       { fontSize: 52, fontWeight: "900", color: T.cinza1, lineHeight: 56 },
  planPrecoGratis: { fontSize: 46, fontWeight: "900", color: T.verde },
  planPeriodo:     { fontSize: 14, color: T.cinza3, marginBottom: 16 },
  divisor:         { height: 1, backgroundColor: T.cinzaBorda, marginBottom: 16 },
  recursoRow:      { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  recursoCheck:    { color: T.verde, fontSize: 14, fontWeight: "700" },
  recursoTxt:      { fontSize: 14, color: T.cinza2 },
  btnGratis:       { marginTop: 16, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: T.cinzaBorda, alignItems: "center" },
  btnGratisTxt:    { fontSize: 15, fontWeight: "600", color: T.cinza3 },
  btnAssinar:      { marginTop: 16, padding: 15, borderRadius: 12, backgroundColor: T.amarelo, alignItems: "center", shadowColor: T.amarelo, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnAssinarTxt:   { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
  garantias:       { padding: 24, alignItems: "center", gap: 8, marginBottom: 40 },
  garantiaTxt:     { fontSize: 13, color: T.cinza3 },
});


// ============================================================
// EDGE FUNCTION DO SUPABASE — criar-pagamento
// Arquivo: supabase/functions/criar-pagamento/index.ts
// ============================================================
//
// Esta função roda no servidor do Supabase e cria o
// PaymentIntent com segurança (usando a Secret Key)
//
// Para criar:
// 1. Instala o Supabase CLI: npm install -g supabase
// 2. supabase functions new criar-pagamento
// 3. Cola o código abaixo no arquivo criado
// 4. supabase functions deploy criar-pagamento
//
// ── CÓDIGO DA EDGE FUNCTION ──────────────────────────────
//
// import Stripe from "https://esm.sh/stripe@14";
//
// const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
//   apiVersion: "2024-04-10",
// });
//
// Deno.serve(async (req) => {
//   const { priceId } = await req.json();
//
//   // Pega o usuário logado
//   const authHeader = req.headers.get("Authorization")!;
//   const token = authHeader.replace("Bearer ", "");
//   const { data: { user } } = await supabaseAdmin.auth.getUser(token);
//
//   // Cria ou busca o customer no Stripe
//   let customerId = user.user_metadata.stripe_customer_id;
//   if (!customerId) {
//     const customer = await stripe.customers.create({ email: user.email });
//     customerId = customer.id;
//   }
//
//   // Cria a assinatura
//   const subscription = await stripe.subscriptions.create({
//     customer: customerId,
//     items: [{ price: priceId }],
//     payment_behavior: "default_incomplete",
//     expand: ["latest_invoice.payment_intent"],
//   });
//
//   const ephemeralKey = await stripe.ephemeralKeys.create(
//     { customer: customerId },
//     { apiVersion: "2024-04-10" }
//   );
//
//   return new Response(JSON.stringify({
//     paymentIntent: subscription.latest_invoice.payment_intent.client_secret,
//     ephemeralKey: ephemeralKey.secret,
//     customer: customerId,
//   }), { headers: { "Content-Type": "application/json" } });
// });
//
// ── VARIÁVEL DE AMBIENTE ─────────────────────────────────
// No Supabase Dashboard > Settings > Edge Functions > Secrets:
// Nome: STRIPE_SECRET_KEY
// Valor: sk_test_... (sua secret key do Stripe)
