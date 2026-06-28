import { useState } from "react";

const STEPS = ["product", "scripts", "landing"];

const SYSTEM_PRODUCT = `Tu es un expert en dropshipping et e-commerce TikTok. L'utilisateur te donne une niche ou un produit.
Tu dois répondre UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans texte avant ou après.

Format exact:
{
  "productName": "Nom du produit phare",
  "emoji": "emoji représentatif",
  "tagline": "Accroche produit ultra-courte (max 8 mots)",
  "score": 87,
  "prix_achat": "3–6€",
  "prix_vente": "24.99€",
  "marge": "76%",
  "wow_factor": "Ce qui rend ce produit viral visuellement ou émotionnellement",
  "audience": "Femmes 18–34, intéressées par la beauté/routine",
  "tendance": "En forte hausse sur TikTok Shop FR/ES",
  "avantages": ["Avantage 1", "Avantage 2", "Avantage 3"],
  "risques": ["Risque 1", "Risque 2"],
  "verdict": "Phrase de conclusion sur le potentiel du produit"
}`;

const SYSTEM_SCRIPTS = `Tu es un expert en contenu TikTok viral pour le dropshipping. On te donne un produit.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.

Format exact:
{
  "scripts": [
    {
      "titre": "Titre du script",
      "hook": "Les 3 premières secondes (doit stopper le scroll)",
      "conflit": "Le problème que ressent le spectateur",
      "revelation": "Comment le produit résout ce problème de façon surprenante",
      "cta": "Call to action final",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
      "duree": "15–20 sec",
      "style": "POV / Démonstration / Témoignage / Tendance"
    }
  ]
}

Génère exactement 5 scripts variés, avec des hooks différents (question, choc, secret, défi, statistique).`;

const SYSTEM_LANDING = `Tu es un expert en copywriting e-commerce. On te donne un produit avec ses détails.
Génère une landing page HTML complète, moderne, mobile-first, prête à copier dans Shopify.
Réponds UNIQUEMENT avec le HTML brut, sans markdown, sans backticks, sans explication.
Le HTML doit inclure le CSS inline dans un tag <style> et être autonome.
Design: fond blanc, accents violet #7C3AED et rose #EC4899, police system-ui.
Inclure: hero avec emoji + tagline, 3 bénéfices clés, section sociale proof, bouton CTA.`;

export default function TikTokAgent() {
  const [step, setStep] = useState("product");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [scriptsData, setScriptsData] = useState(null);
  const [landingHtml, setLandingHtml] = useState("");
  const [error, setError] = useState("");
  const [activeScript, setActiveScript] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const callClaude = async (systemPrompt, userMessage) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    const data = await response.json();
    return data.content.map(i => i.text || "").join("");
  };

  const analyzeProduct = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const raw = await callClaude(SYSTEM_PRODUCT, `Niche / produit : ${input}`);
      const parsed = JSON.parse(raw);
      setProductData(parsed);
      setStep("scripts");
    } catch (e) {
      setError("Erreur d'analyse. Réessaie avec un produit ou niche plus précis.");
    }
    setLoading(false);
  };

  const generateScripts = async () => {
    setLoading(true);
    setError("");
    try {
      const context = `Produit: ${productData.productName}. Audience: ${productData.audience}. Wow factor: ${productData.wow_factor}. Prix vente: ${productData.prix_vente}.`;
      const raw = await callClaude(SYSTEM_SCRIPTS, context);
      const parsed = JSON.parse(raw);
      setScriptsData(parsed);
      setStep("landing");
    } catch (e) {
      setError("Erreur génération scripts. Réessaie.");
    }
    setLoading(false);
  };

  const generateLanding = async () => {
    setLoading(true);
    setError("");
    try {
      const context = `Produit: ${productData.productName}. Tagline: ${productData.tagline}. Avantages: ${productData.avantages.join(", ")}. Prix: ${productData.prix_vente}. Audience: ${productData.audience}. Wow factor: ${productData.wow_factor}.`;
      const html = await callClaude(SYSTEM_LANDING, context);
      setLandingHtml(html);
    } catch (e) {
      setError("Erreur génération landing page.");
    }
    setLoading(false);
  };

  const copyText = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const scoreColor = (s) => s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f13", color: "#f1f1f3", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a0533 0%, #0f0f13 60%)", borderBottom: "1px solid #2d1b4e", padding: "20px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #7C3AED, #EC4899)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚡</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}>TikTok Drop Agent</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>Produit · Scripts · Landing Page</div>
          </div>
          {/* Steps indicator */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {[{k:"product", label:"Produit"}, {k:"scripts", label:"Scripts"}, {k:"landing", label:"Page"}].map(({k, label}, i) => (
              <div key={k} style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: step === k ? "linear-gradient(135deg, #7C3AED, #EC4899)" : productData && STEPS.indexOf(k) <= STEPS.indexOf(step) ? "#2d1b4e" : "#1a1a24",
                color: step === k ? "#fff" : "#9ca3af",
                border: "1px solid " + (step === k ? "transparent" : "#2d1b4e")
              }}>{label}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>

        {/* STEP 1 — Product Input */}
        {!productData && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", background: "linear-gradient(135deg, #c084fc, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Trouve ton produit gagnant
              </h1>
              <p style={{ color: "#9ca3af", margin: 0, fontSize: 15 }}>Entre une niche, un mot-clé ou un produit — l'agent fait le reste.</p>
            </div>
            <div style={{ background: "#1a1a24", border: "1px solid #2d1b4e", borderRadius: 16, padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#9ca3af", display: "block", marginBottom: 8 }}>Niche ou produit</label>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && analyzeProduct()}
                  placeholder="ex: soin visage LED, brosse anti-poils, porte-clés GPS..."
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #3d2b6e",
                    background: "#0f0f13", color: "#f1f1f3", fontSize: 15, outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {["Soin visage LED", "Massage gun mini", "Organisateur bureau", "Bouteille connectée"].map(s => (
                  <button key={s} onClick={() => setInput(s)} style={{
                    padding: "6px 12px", borderRadius: 20, border: "1px solid #3d2b6e", background: "#0f0f13",
                    color: "#c084fc", fontSize: 12, cursor: "pointer"
                  }}>{s}</button>
                ))}
              </div>
              <button onClick={analyzeProduct} disabled={loading || !input.trim()} style={{
                width: "100%", padding: "14px", borderRadius: 10, border: "none",
                background: loading ? "#2d1b4e" : "linear-gradient(135deg, #7C3AED, #EC4899)",
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
              }}>
                {loading ? "Analyse en cours..." : "Analyser le potentiel →"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Product Result */}
        {productData && step !== "product" && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ background: "#1a1a24", border: "1px solid #2d1b4e", borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 48 }}>{productData.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{productData.productName}</div>
                  <div style={{ color: "#c084fc", fontSize: 14, marginTop: 4 }}>{productData.tagline}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: scoreColor(productData.score) }}>{productData.score}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>score /100</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Prix achat", val: productData.prix_achat, icon: "📦" },
                  { label: "Prix vente", val: productData.prix_vente, icon: "🏷️" },
                  { label: "Marge", val: productData.marge, icon: "💰" },
                ].map(({ label, val, icon }) => (
                  <div key={label} style={{ background: "#0f0f13", borderRadius: 10, padding: "12px 14px", border: "1px solid #2d1b4e" }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{val}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.6, background: "#0f0f13", padding: "12px 14px", borderRadius: 10, border: "1px solid #2d1b4e" }}>
                💡 {productData.verdict}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Scripts */}
        {step === "scripts" && !scriptsData && (
          <div style={{ background: "#1a1a24", border: "1px solid #2d1b4e", borderRadius: 16, padding: 24 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎬</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>Générer 5 scripts TikTok</h2>
              <p style={{ color: "#9ca3af", margin: 0, fontSize: 14 }}>Hooks viraux · Formats variés · Hashtags optimisés</p>
            </div>
            <button onClick={generateScripts} disabled={loading} style={{
              width: "100%", padding: "14px", borderRadius: 10, border: "none",
              background: loading ? "#2d1b4e" : "linear-gradient(135deg, #7C3AED, #EC4899)",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
            }}>
              {loading ? "Génération en cours..." : "Créer les scripts →"}
            </button>
          </div>
        )}

        {/* Scripts Result */}
        {scriptsData && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {scriptsData.scripts.map((s, i) => (
                <button key={i} onClick={() => setActiveScript(i)} style={{
                  padding: "8px 14px", borderRadius: 10, border: "1px solid " + (activeScript === i ? "#7C3AED" : "#2d1b4e"),
                  background: activeScript === i ? "#3b0764" : "#1a1a24",
                  color: activeScript === i ? "#e9d5ff" : "#9ca3af", fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}>Script {i + 1}</button>
              ))}
            </div>
            {scriptsData.scripts[activeScript] && (() => {
              const s = scriptsData.scripts[activeScript];
              return (
                <div style={{ background: "#1a1a24", border: "1px solid #3d2b6e", borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{s.titre}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <span style={{ background: "#1e1b4b", color: "#a5b4fc", padding: "2px 8px", borderRadius: 20, fontSize: 11 }}>{s.style}</span>
                        <span style={{ background: "#1e1b4b", color: "#a5b4fc", padding: "2px 8px", borderRadius: 20, fontSize: 11 }}>{s.duree}</span>
                      </div>
                    </div>
                    <button onClick={() => copyText(`HOOK: ${s.hook}\n\nCONFLIT: ${s.conflit}\n\nRÉVÉLATION: ${s.revelation}\n\nCTA: ${s.cta}\n\n${s.hashtags.join(" ")}`, activeScript)} style={{
                      padding: "8px 14px", borderRadius: 8, border: "1px solid #3d2b6e", background: copiedIndex === activeScript ? "#10b981" : "#0f0f13",
                      color: copiedIndex === activeScript ? "#fff" : "#9ca3af", fontSize: 12, cursor: "pointer"
                    }}>{copiedIndex === activeScript ? "✓ Copié" : "📋 Copier"}</button>
                  </div>
                  {[
                    { label: "🎯 HOOK (0–3 sec)", text: s.hook, color: "#fbbf24" },
                    { label: "😤 CONFLIT", text: s.conflit, color: "#f87171" },
                    { label: "✨ RÉVÉLATION", text: s.revelation, color: "#34d399" },
                    { label: "👆 CTA", text: s.cta, color: "#60a5fa" },
                  ].map(({ label, text, color }) => (
                    <div key={label} style={{ marginBottom: 14, background: "#0f0f13", borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${color}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6 }}>{label}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.6, color: "#e5e7eb" }}>{text}</div>
                    </div>
                  ))}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
                    {s.hashtags.map(h => (
                      <span key={h} style={{ background: "#3b0764", color: "#e9d5ff", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>{h}</span>
                    ))}
                  </div>
                </div>
              );
            })()}
            {step === "landing" && !landingHtml && (
              <div style={{ marginTop: 24, background: "#1a1a24", border: "1px solid #2d1b4e", borderRadius: 16, padding: 24 }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🛍️</div>
                  <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>Générer la landing page</h2>
                  <p style={{ color: "#9ca3af", margin: 0, fontSize: 13 }}>HTML prêt à copier dans Shopify · Mobile-first · Copywriting optimisé</p>
                </div>
                <button onClick={generateLanding} disabled={loading} style={{
                  width: "100%", padding: "14px", borderRadius: 10, border: "none",
                  background: loading ? "#2d1b4e" : "linear-gradient(135deg, #7C3AED, #EC4899)",
                  color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer"
                }}>
                  {loading ? "Création en cours..." : "Créer la landing page →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Landing Page Result */}
        {landingHtml && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>🛍️ Landing Page générée</div>
              <button onClick={() => copyText(landingHtml, 999)} style={{
                padding: "8px 14px", borderRadius: 8, border: "1px solid #3d2b6e",
                background: copiedIndex === 999 ? "#10b981" : "#0f0f13",
                color: copiedIndex === 999 ? "#fff" : "#9ca3af", fontSize: 12, cursor: "pointer"
              }}>{copiedIndex === 999 ? "✓ Copié" : "📋 Copier le HTML"}</button>
            </div>
            <div style={{ border: "1px solid #3d2b6e", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: "#1a1a24", padding: "8px 16px", display: "flex", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }}></div>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }}></div>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }}></div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#9ca3af" }}>Aperçu · {productData.productName}</div>
              </div>
              <iframe
                srcDoc={landingHtml}
                style={{ width: "100%", height: 500, border: "none", background: "#fff" }}
                title="Landing page preview"
              />
            </div>
          </div>
        )}

        {/* Reset */}
        {productData && (
          <button onClick={() => { setProductData(null); setScriptsData(null); setLandingHtml(""); setStep("product"); setInput(""); setError(""); }} style={{
            padding: "10px 20px", borderRadius: 8, border: "1px solid #2d1b4e", background: "transparent",
            color: "#9ca3af", fontSize: 13, cursor: "pointer", display: "block", margin: "0 auto"
          }}>← Nouveau produit</button>
        )}

        {error && (
          <div style={{ background: "#1a0a0a", border: "1px solid #7f1d1d", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 13, marginTop: 16 }}>
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}
